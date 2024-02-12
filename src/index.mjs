import fetch from 'node-fetch';
import Database from 'better-sqlite3';
import { AsyncTokenBucket } from './token-bucket.mjs';

const CLASSIC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36';
const API_ENDPOINT = 'https://neal.fun/api/infinite-craft/pair?';
const DISGUISE_HEADERS = {
	'Referer': 'https://neal.fun/infinite-craft/',
	'Host': 'neal.fun',
	'User-Agent': CLASSIC_UA,
	'TE': 'trailers',
};

async function doCraft(ingrA, ingrB) {
	try {
		const req = await fetch(API_ENDPOINT + new URLSearchParams({
			first: ingrA,
			second: ingrB,
		}), {
			headers: DISGUISE_HEADERS
		});
		const data = await req.json();
		return data;
	} catch (e) {
		return null;
	}
}

const db = new Database('./craft.sqlite');
db.pragma('journal_mode = WAL');
let explored_N = db.prepare('SELECT COUNT(*) AS res FROM Recipes').get().res;

const best_explore_item = db.prepare(`
SELECT * FROM Items ORDER BY
	((Items.reward + 1) / (Items.explore + 1) + 2 * SQRT(? / (Items.explore + 1))) DESC
LIMIT 1
`);

const random_explore_item = db.prepare(`
SELECT * FROM Items WHERE NOT EXISTS (
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
INSERT INTO Items (handle, emoji, is_new) VALUES (?, ?, ?)
`);

async function exploreOnce() {
	const lnN2 = Math.log(explored_N + 1) / 2;
	const ingrA = best_explore_item.get(lnN2);
	update_explore_count.run(ingrA.id);
	explored_N += 1;
	const ingrB = random_explore_item.get({other: ingrA.id});
	if (ingrB == null) { return; }
	update_explore_count.run(ingrB.id);

	create_new_recipe.run(ingrA.id, ingrB.id, null);
	let recc = load_recipe_by_ingrediants.get({aid: ingrA.id, bid: ingrB.id});

	const res = await doCraft(ingrA.handle, ingrB.handle);
	if (res == null) {
		console.log(`Crafting ${ingrA.handle} and ${ingrB.handle} failed.`);
		return;
	}

	console.log(`Crafting ${ingrA.handle} and ${ingrB.handle}: ${res.result}`);
	let resc = load_item_by_handle.get(res.result);
	if (resc == null) {
		console.log(`New item unlocked: ${res.result}`);
		create_new_item.run(res.result, res.emoji, res.isNew ? 1 : 0);
		resc = load_item_by_handle.get(res.result);
		update_reward_count.run(ingrA.id);
		update_reward_count.run(ingrB.id);
	}
	set_recipe_result.run(resc.id, recc.id);
}

async function main() {
	let bucket = new AsyncTokenBucket(2);
	while (true) {
		await bucket.aquire();
		queueMicrotask(async () => {
			await exploreOnce();
			bucket.refill();
		});
	}
}

main();
// console.log(await exploreOnce());

process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
