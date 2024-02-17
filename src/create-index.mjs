import Database from 'better-sqlite3';
import { PriorityQueue } from './pq.mjs';
import fs from 'node:fs/promises';
import { serializeToBinary } from 'binary-struct';
import { BinaryItem, BinaryRecipe, BinaryTransferData } from './data-typedef.mjs';
import ProgressBar from 'progress';

const db = new Database('./craft.sqlite', { readonly: true });

const all_items = db.prepare('SELECT id, handle, emoji FROM Items').all();
const all_recipes = db.prepare('SELECT id, ingrA_id, ingrB_id, result_id FROM Recipes WHERE result_id IS NOT NULL').all();

class Recipe {
	constructor(id, ingrA, ingrB, result) {
		this.id = id;
		this.ingrA = ingrA;
		this.ingrB = ingrB;
		this.result = result;
	}

	toString() {
		return `${this.ingrA} + ${this.ingrB} = ${this.result}`;
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

	isNothing() {
		return this.handle == 'Nothing';
	}

	toString() {
		return this.handle;
	}
}

const item_id_list = [], recipe_id_list = [];
const items_by_id = {}, recipes_by_id = {};

let NOTHING_ID = null;
for (const item of all_items) {
	item_id_list.push(item.id);
	let it = new Item(item.id, item.handle, item.emoji);
	items_by_id[item.id] = it;
	if (it.isNothing()) {
		NOTHING_ID = it.id;
	}
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


const bar = new ProgressBar(':bar [:percent :current/:total] [:rate items/s] [:etas]', { total: item_id_list.length });

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

let res = new BinaryTransferData();
res.NOTHING_ID = NOTHING_ID;
res.items = [];
res.recipes = [];
for (const id of item_id_list) {
	const it = items_by_id[id];
	let b = new BinaryItem();
	b.id = it.id;
	b.handle = it.handle;
	b.emoji = it.emoji;
	b.dep = it.dep;
	b._craft_path_source = it.craft_path_source?.id ?? 0,
	res.items.push(b);
}


for (const id of recipe_id_list) {
	const recipe = recipes_by_id[id];
	let b = new BinaryRecipe();
	b.id = recipe.id;
	b.ingrA_id = recipe.ingrA.id;
	b.ingrB_id = recipe.ingrB.id;
	b.result_id = recipe.result.id;
	res.recipes.push(b);
}

await fs.writeFile('./craft.dat', Buffer.from(serializeToBinary(res, BinaryTransferData)));

process.on('exit', () => db.close());
