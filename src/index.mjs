import fetch from 'node-fetch';
import Database from 'better-sqlite3';
import { AsyncTokenBucket } from './token-bucket.mjs';

const CLASSIC_UA = 'Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0';
const API_ENDPOINT = 'https://neal.fun/api/infinite-craft/pair?';
// const API_ENDPOINT = 'https://httpbin.org/anything?';
const DISGUISE_HEADERS = {
	'User-Agent': CLASSIC_UA,
	'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.7,zh-TW;q=0.5,zh-HK;q=0.3,en;q=0.2',
	'Referer': 'https://neal.fun/infinite-craft/',
	'Sec-Fetch-Dest': 'empty',
	'Sec-Fetch-Mode': 'cors',
	'Sec-Fetch-Site': 'same-origin',
	'Connection': 'keep-alive',
};

function sleep(t) {
	return new Promise((res) => {
		setTimeout(res, t);
	});
}

async function doCraft(ingrA, ingrB, retry = 10) {
	try {
		const req = await fetch(API_ENDPOINT + new URLSearchParams({
			first: ingrA,
			second: ingrB,
		}), {
			headers: DISGUISE_HEADERS
		});
		const data = await req.text();
		if (data.startsWith('<!DOCTYPE')) {
			if (retry <= 0) {
				console.error('[ERROR] All retries used, CloudFlare Protecting');
				return null;
			} else {
				console.error('[RETRY] CloudFlare Protecting');
				await sleep(1000);
				return await doCraft(ingrA, ingrB, retry - 1);
			}
		}
		return JSON.parse(data);
	} catch (e) {
		if (retry <= 0) {
			console.error('[ERROR] All retries used.');
			return null;
		} else {
			console.error('[RETRY] Error Occured');
			await sleep(1000);
			return await doCraft(ingrA, ingrB, retry - 1);
		}
	}
}

const db = new Database('./craft.sqlite');
db.pragma('journal_mode = WAL');
let explored_N = db.prepare('SELECT COUNT(*) AS res FROM Recipes').get().res;

const best_explore_item = db.prepare(`
SELECT * FROM Items WHERE freq IS NOT NULL ORDER BY
	((Items.reward + 1) / (Items.explore + 1) + 0.5 * SQRT(? / (Items.explore + 1))) DESC
LIMIT 1
`);

const random_explore_item = db.prepare(`
SELECT * FROM Items WHERE freq IS NOT NULL AND NOT EXISTS (
	SELECT ingrA_id, ingrB_id FROM Recipes WHERE (
		(ingrA_id = $other AND ingrB_id = Items.id) OR
		(ingrA_id = Items.id AND ingrB_id = $other)
	)
) ORDER BY RANDOM() LIMIT 1
`);

const update_explore_count = db.prepare(
	'UPDATE Items SET explore = explore + 1 WHERE id = ?'
);

const update_reward_count = db.prepare(
	'UPDATE Items SET reward = reward + 1 WHERE id = ?'
);

const create_new_recipe = db.prepare(`
INSERT INTO Recipes (ingrA_id, ingrB_id, result_id) VALUES (?, ?, ?)
`);

const load_item_by_handle = db.prepare(`
SELECT * FROM Items WHERE (handle = ?)
`);

const load_recipe_by_ingrediants = db.prepare(`
SELECT * FROM Recipes WHERE (
	(ingrA_id = $aid AND ingrB_id = $bid) OR
	(ingrA_id = $bid AND ingrB_id = $aid)
)
`);

const set_recipe_result = db.prepare(`
UPDATE Recipes SET result_id = ? WHERE id = ?
`);

const create_new_item = db.prepare(`
INSERT INTO Items (handle, emoji, is_new, freq) VALUES (?, ?, ?, ?)
`);

const load_word_by_lemma = db.prepare(`
SELECT * FROM EnglishWords WHERE lemma=LOWER(?)
`)

async function exploreOnce() {
	const lnN2 = Math.log(explored_N + 1) / 2;
	const ingrA = best_explore_item.get(lnN2);
	update_explore_count.run(ingrA.id);
	explored_N += 1;
	const ingrB = random_explore_item.get({other: ingrA.id});
	if (ingrB == null) { return false; }
	update_explore_count.run(ingrB.id);

	create_new_recipe.run(ingrA.id, ingrB.id, null);
	let recc = load_recipe_by_ingrediants.get({aid: ingrA.id, bid: ingrB.id});

	const res = await doCraft(ingrA.handle, ingrB.handle);
	if (res == null) {
		console.log(`Crafting ${ingrA.handle} and ${ingrB.handle} failed.`);
		return false;
	}

	console.log(`Crafting ${ingrA.handle} and ${ingrB.handle}: ${res.result}`);
	let resc = load_item_by_handle.get(res.result);
	if (resc == null) {
		const word = load_word_by_lemma.get(res.result);
		console.log(`New item unlocked: ${res.result}(${word?.freq})`);
		create_new_item.run(res.result, res.emoji, res.isNew ? 1 : 0, word?.freq);
		resc = load_item_by_handle.get(res.result);
		update_reward_count.run(ingrA.id);
		update_reward_count.run(ingrB.id);
	}
	set_recipe_result.run(resc.id, recc.id);
	return true;
}

async function main() {
	let fail_cnt = 0, task_cnt = 0;
	let bucket = new AsyncTokenBucket(2);
	await bucket.aquire();
	let iv = setInterval(() => {
		if (fail_cnt < 1) {
			if (task_cnt < 2) {
				bucket.refill();
			}
		} else {
			clearInterval(iv);
		}
	}, 500);

	while (true) {
		await bucket.aquire();
		queueMicrotask(async () => {
			task_cnt += 1;
			if (!await exploreOnce()) {
				fail_cnt += 1;
			}
			task_cnt -= 1;
		});
	}
}

main();
// console.log(await doCraft('Wig', 'Lizard'));
// exploreOnce();

process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
