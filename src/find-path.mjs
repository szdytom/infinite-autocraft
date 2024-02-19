import Database from 'better-sqlite3';
import { PriorityQueue } from './pq.mjs';
import ProgressBar from 'progress';

const db = new Database('./craft.sqlite');

process.on('exit', () => db.close());
process.on('SIGINT', () => process.exit(1));
process.on('SIGHUP', () => process.exit(1));
process.on('SIGTERM', () => process.exit(1));

db.prepare('UPDATE Items SET dep = NULL WHERE dep IS NOT NULL').run();

const NOTHING_ID = db.prepare('SELECT id FROM Items WHERE handle=?').get('Nothing').id;

const update_item_dep = db.prepare(`
UPDATE Items SET dep = $dep WHERE id = $id
`);

const nothing_check = db.prepare(`
SELECT COUNT(*) AS res FROM Recipes WHERE ingrA_id = $n OR ingrB_id = $n;
`);

if (nothing_check.get({n: NOTHING_ID}).res > 0) {
	console.log('WARN! Nothing used in recipe!!!');
}

const all_items = db.prepare('SELECT id, handle, emoji FROM Items').all();
const all_recipes = db.prepare('SELECT id, ingrA_id, ingrB_id, result_id FROM Recipes WHERE result_id IS NOT NULL').all();

class Recipe {
	constructor(id, ingrA, ingrB, result) {
		this.id = id;
		this.ingrA = ingrA;
		this.ingrB = ingrB;
		this.result = result;
	}
}

class Item {
	constructor(id, handle, emoji) {
		this.id = id;
		this.handle = handle;
		this.emoji = emoji;
		this.can_craft = [];
		this.craft_by = [];
		this.craft_path_source = null;
		this.dep = -1;
	}

	addCanCraftRecipe(r) {
		this.can_craft.push(r);
	}

	addCraftByRecipe(r) {
		this.craft_by.push(r);
	}
}

const item_id_list = [], recipe_id_list = [];
const items_by_id = {}, recipes_by_id = {};

for (const item of all_items) {
	item_id_list.push(item.id);
	let it = new Item(item.id, item.handle, item.emoji);
	items_by_id[item.id] = it;
}

for (const recipe of all_recipes) {
	if (recipe.result_id == NOTHING_ID) {
		continue;
	}

	if (recipe.ingrA == recipe.result_id || recipe.ingrB == recipe.result_id) {
		continue;
	}

	recipe_id_list.push(recipe.id);
	const ingrA = items_by_id[recipe.ingrA_id];
	const ingrB = items_by_id[recipe.ingrB_id];
	const result = items_by_id[recipe.result_id];
	const r = new Recipe(recipe.id, ingrA, ingrB, result);
	recipes_by_id[recipe.id] = r;
	ingrA.addCanCraftRecipe(r);
	if (ingrB != ingrA) {
		ingrB.addCanCraftRecipe(r);
	}
	result.addCraftByRecipe(r);
}

let q = new PriorityQueue();
for (let i = 1; i <= 4; ++i) {
	items_by_id[i].dep = 0;
	q.push(i, 0);
}

let vis = [];
items_by_id[NOTHING_ID].dep = 0;

let bar = new ProgressBar(':bar [:percent :current/:total] [:rate items/s] [:etas]', { total: item_id_list.length });

while (!q.empty()) {
	let xid = q.pop()[0];
	let x = items_by_id[xid];
	if (vis[xid]) {
		continue;
	}
	vis[xid] = true;
	bar.tick();

	for (const edge of x.can_craft) {
		const p = edge.ingrA.id == xid ? edge.ingrB : edge.ingrA;
		if (p.dep == -1 || p.id == NOTHING_ID) {
			continue;
		}

		const y = edge.result;
		const z = Math.max(p.dep, x.dep) + 1;
		if (y.dep == -1 || y.dep > z) {
			y.dep = z;
			y.craft_path_source = edge;
			q.push(y.id, -z);
		}
	}
}

bar.update(1);
bar.terminate();

bar = new ProgressBar(':bar [:percent :current/:total] [:rate items/s] [:etas]', { total: item_id_list.length });

db.transaction(() => {
	for (const id of item_id_list) {
		if (id == NOTHING_ID) {
			continue;
		}
		const it = items_by_id[id];
		if (it.dep != -1) {
			update_item_dep.run({ id, dep: it.dep });
			bar.tick();
		}
	}
})();

bar.update(1);
bar.terminate();
