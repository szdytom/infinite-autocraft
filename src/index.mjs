import fetch from 'node-fetch';
import Database from 'better-sqlite3';
import { AsyncTokenBucket, Queue } from './token-bucket.mjs';
import fs from 'node:fs/promises';
import { firefox } from 'playwright';

const CLASSIC_UA = 'Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0';
const API_ENDPOINT = 'https://neal.fun/api/infinite-craft/pair?';
const DISGUISE_HEADERS = {
	// 'User-Agent': CLASSIC_UA,
	'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.7,zh-TW;q=0.5,zh-HK;q=0.3,en;q=0.2',
	// 'Referer': 'https://neal.fun/infinite-craft/',
	'DNT': '1',
	'Sec-Fetch-Dest': 'empty',
	'Sec-Fetch-Mode': 'cors',
	'Sec-Fetch-Site': 'same-origin',
	'Sec-GPC': '1',
	'Connection': 'keep-alive',
};

const RecipeDB_API_ENDPOINT = 'https://infini-recipe.fly.dev/recipes?page=';
const RecipeDB_DISGUISE_HEADERS = {
	'User-Agent': CLASSIC_UA,
	'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.7,zh-TW;q=0.5,zh-HK;q=0.3,en;q=0.2',
	'Referer': 'https://infini-recipe.vercel.app/',
	'Origin': 'https://infini-recipe.vercel.app',
	'Sec-Fetch-Dest': 'empty',
	'Sec-Fetch-Mode': 'cors',
	'Sec-Fetch-Site': 'cross-site',
	// 'Connection': 'keep-alive',
	'TE': 'trailers',
}

let isExiting = false;

function sleep(t) {
	return new Promise((res) => {
		setTimeout(res, t);
	});
}

const browser = await firefox.launch({
	// headless: false,
	proxy: {
		server: 'sock5://127.0.0.1:2080',
	},
});
const page = await browser.newPage();
await page.goto('https://neal.fun/infinite-craft/');
console.log('Initialized headless-browser');

async function fetchFF(url, options = {}) {
	const responseBody = await page.evaluate(async ({url, options}) => {
		const fetchResponse = await fetch(url, options);
		return await fetchResponse.json();
	}, {url, options});

	return responseBody;
}

async function doCraft(ingrA, ingrB, retry = 3) {
	console.log(`Start downloading ${ingrA} + ${ingrB}`);
	try {
		const data = await fetchFF(API_ENDPOINT + new URLSearchParams({
			first: ingrA,
			second: ingrB,
		}), {
			headers: DISGUISE_HEADERS,
		});
		// if (data.startsWith('<!DOCTYPE')) {
		// 	if (retry <= 0) {
		// 		console.error('[ERROR] All retries used, CloudFlare Rate Limit');
		// 		return null;
		// 	} else {
		// 		console.error('[RETRY] CloudFlare Rate Limit');
		// 		await sleep(1000);
		// 		return await doCraft(ingrA, ingrB, retry - 1);
		// 	}
		// }
		return data;
	} catch (e) {
		console.log(e);
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
db.pragma('journal_mode = delete');
let explored_N = db.prepare('SELECT COUNT(*) AS res FROM Recipes').get().res;

const bestUC_explore_item = db.prepare(`
SELECT * FROM Items WHERE
-- freq IS NOT NULL AND
dep <= 10 AND
((mask & 1) = 0) ORDER BY
	((Items.reward + 1) / (Items.explore + 1) + 0.5 * SQRT(? / (Items.explore + 1))) DESC
LIMIT 1
`);

// const best_explore_item = db.prepare(`
// SELECT * FROM Items WHERE id=1712 OR 1=?
// LIMIT 1
// `);

//-- freq IS NOT NULL AND 
const random_explore_item = db.prepare(`
SELECT * FROM Items WHERE
-- freq IS NOT NULL AND
dep <= 10 AND
((mask & 1) = 0)
AND NOT EXISTS (
	SELECT ingrA_id, ingrB_id FROM Recipes WHERE (
		(ingrA_id = $other AND ingrB_id = Items.id) OR
		(ingrA_id = Items.id AND ingrB_id = $other)
	)
) ORDER BY RANDOM() LIMIT 1
`);

const possible_explore_items_with = db.prepare(`
SELECT * FROM Items WHERE
((mask & 2) = 2) AND NOT EXISTS (
	SELECT ingrA_id, ingrB_id FROM Recipes WHERE (
		(ingrA_id = $other AND ingrB_id = Items.id) OR
		(ingrA_id = Items.id AND ingrB_id = $other)
	)
)
`);

const possible_self_explore_items = db.prepare(`
SELECT * FROM Items WHERE
((mask & 2) = 2) AND NOT EXISTS (
	SELECT ingrA_id, ingrB_id FROM Recipes WHERE
		(ingrA_id = Items.id AND ingrB_id = Items.id)
)
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

const create_new_recipe_imported = db.prepare(`
INSERT INTO Recipes (ingrA_id, ingrB_id, result_id, mask) VALUES (?, ?, ?, 1)
`);

const load_item_by_handle = db.prepare(`
SELECT * FROM Items WHERE (handle = ?)
`);

const load_recipe_by_ingredients = db.prepare(`
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

async function exploreWith(ingrA, ingrB) {
	if ((ingrA.mask & 1) == 1 || (ingrB.mask & 1) == 1) {
		console.error('[ERROR] BANNED ITEM USED!!!');
		return -1;
	}
	update_explore_count.run(ingrA.id);
	update_explore_count.run(ingrB.id);
	create_new_recipe.run(ingrA.id, ingrB.id, null);
	let recc = load_recipe_by_ingredients.get({ aid: ingrA.id, bid: ingrB.id });

	const res = await doCraft(ingrA.handle, ingrB.handle);
	if (res == null) {
		console.log(`Crafting ${ingrA.handle} and ${ingrB.handle} failed.`);
		return -1;
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
	return 1;
}

async function importRecipeCheck(Ahandle, Bhandle, Rhandle) {
	if (Ahandle == 'Nothing' || Bhandle == 'Nothing') {
		return 0;
	}
	let ingrA = load_item_by_handle.get(Ahandle);
	let ingrB = load_item_by_handle.get(Bhandle);
	let res_row = load_item_by_handle.get(Rhandle);
	if (ingrA == null || ingrB == null) {
		console.log(`[IMPORT FAILED] ${Ahandle} or ${Bhandle} is unkown.`);
		return 0;
	}

	if (res_row == null) {
		return await exploreWithChecked(ingrA, ingrB);
	}

	const rec = load_recipe_by_ingredients.get({ aid: ingrA.id, bid: ingrB.id });
	if (rec != null) {
		console.log(`[SKIPPED] Craft ${ingrA.handle} and ${ingrB.handle}.`);
		return 0;
	}

	create_new_recipe_imported.run(ingrA.id, ingrB.id, res_row.id);
	return 0;
}

async function exploreUC() {
	const lnN2 = Math.log(explored_N + 1) / 2;
	const ingrA = bestUC_explore_item.get(lnN2);
	explored_N += 1;
	const ingrB = random_explore_item.get({ other: ingrA.id });
	if (ingrB == null) {
		update_explore_count.run(ingrA.id);
		return -1;
	}
	return await exploreWith(ingrA, ingrB);
}

async function exploreWithChecked(ingrA, ingrB) {
	if (ingrA == null || ingrB == null) {
		return -1;
	}

	const rec = load_recipe_by_ingredients.get({ aid: ingrA.id, bid: ingrB.id });
	if (rec != null) {
		console.log(`[SKIPPED] Craft ${ingrA.handle} and ${ingrB.handle}.`);
		return 0;
	}
	return await exploreWith(ingrA, ingrB);
}

async function exploreCustom(Ahandle, Bhandle) {
	return await exploreWithChecked(load_item_by_handle.get(Ahandle), load_item_by_handle.get(Bhandle));
}

let eq = new Queue();
async function exploreByQueue() {
	if (eq.empty()) {
		return -1;
	}
	const [Ahandle, Bhandle] = eq.front();
	eq.popFront();
	return await exploreCustom(Ahandle, Bhandle);
}

async function importByQueue() {
	if (eq.empty()) {
		return 1;
	}
	const [Ahandle, Bhandle, Rhandle] = eq.front();
	eq.popFront();
	return await importRecipeCheck(Ahandle, Bhandle, Rhandle);
}

async function requestRecipesDB(page) {
	try {
		let res = await fetch(RecipeDB_API_ENDPOINT + page.toString(), {
			headers: RecipeDB_DISGUISE_HEADERS,
		});
		return await res.json();
	} catch (e) {
		console.log(`RECIPE_DB REQUEST FAILED!`);
		return null;
	}
}

async function buildRecipesDBExploreList() {
	const page_st = 5868, page_ed = 59692;
	// const page_st = 1, page_ed = 3;
	for (let i = page_st; i <= page_ed; ++i) {
		if (isExiting) {
			break;
		}

		console.log(`Current RecipeDB Page: ${i}, queue size = ${eq.size()}`);
		while (eq.size() > 100) {
			await sleep(200);
		}
		let res = await requestRecipesDB(i);
		if (res == null) {
			i -= 1;
			await sleep(1000);
			continue;
		}

		for (let r of res) {
			eq.pushBack([r.element1_id, r.element2_id, r.result_element_id]);
		}
	}
}

async function buildContributionList() {
	const data = JSON.parse(await fs.readFile('./relevant_recipes.json', 'utf-8'));
	for (const v of data) {
		eq.pushBack(v);
	}
}

function buildBasicExploreList() {
	const basics = ['Crafting', 'Time', 'Kernel'];
	for (const b of basics) {
		const ingrB = load_item_by_handle.get(b);
		const rows = possible_explore_items_with.all({ other: ingrB.id });
		for (const a of rows) {
			eq.pushBack([a.handle, b]);
		}
	}
}

function buildSelfExploreList() {
	const rows = possible_self_explore_items.all();
	for (const a of rows) {
		eq.pushBack([a.handle, a.handle]);
	}
}

async function buildLoadInFiniteCraftFirstList() {
	const raw_data = await fs.readFile('relevant_recipes.json', 'utf8');
	const data = JSON.parse(raw_data);
	for (const Rhandle of data.o) {
		const r = data.r[Rhandle][0];
		eq.pushBack([r[0], r[1], Rhandle]);
	}
	console.log(`Loaded ${data.o.length} items from JSON file.`);
	// console.log(eq.val.slice(0, 10));
}

let iv = null;
async function main(exploreFunc) {
	const CO_TASK_MAX = 1, ERR_MAX = 1;
	let fail_cnt = 0, task_cnt = 0;
	let bucket = new AsyncTokenBucket(CO_TASK_MAX);
	await bucket.aquire();
	iv = setInterval(() => {
		if (!isExiting && fail_cnt < ERR_MAX) {
			if (task_cnt < CO_TASK_MAX) {
				bucket.refill();
			}
		} else {
			clearInterval(iv);
			browser.close();
		}
	}, 250);

	while (true) {
		await bucket.aquire();
		queueMicrotask(async () => {
			task_cnt += 1;
			while (true) {
				if (isExiting) {
					break;
				}
				let x = await exploreFunc();
				if (x < 0) {
					fail_cnt += 1;
					break;
				}

				if (x != 0) {
					break;
				}
			}
			task_cnt -= 1;
		});
	}
}

// buildSelfExploreList();
// buildBasicExploreList();
// buildRecipesDBExploreList();
// await buildLoadInFiniteCraftFirstList();
await buildContributionList();
main(exploreByQueue);
// console.log(await doCraft('Wig', 'Lizard'));
// console.log(await (await fetch('https://tls.peet.ws/api/all', {
// 	agent: FF_DISGUISE_AGENT,
// })).json())
// console.log(await doCraft('Lava', 'Water'));
// for (let i = ; i <= 2025; ++i) {
// 	if (!await exploreCustom(`Windows ${i}`, 'Last')) {
// 		break;
// 	}
// }
// exploreCustom('Arch', 'Linux');

process.on('exit', async () => {
	db.close();
	await browser.close();
});
process.on('SIGHUP', () => clearInterval(iv));
process.on('SIGINT', () => {
	console.log('Exiting...');
	clearInterval(iv);
	isExiting = true;
});
process.on('SIGTERM', () => process.exit(128 + 15));
