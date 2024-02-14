import Database from 'better-sqlite3';
import { PriorityQueue } from './pq.mjs';

const db = new Database('./craft.sqlite', { readonly: true });

const all_items = db.prepare('SELECT id, handle, emoji FROM Items').all();
const all_recipes = db.prepare('SELECT id, ingrA_id, ingrB_id, result_id FROM Recipes').all();

class Recipes {
	constructor(id, ingrA, ingrB, result) {
		this.id = id;
		this.ingrA = ingrA;
		this.ingrB = ingrB;
		this.result = result;
	}

	toString() {
		return `${this.ingrA} + ${this.ingrB} = ${this.result}`;
	}

	toJSON() {
		return {
			id: this.id,
			ingrA: this.ingrA.id,
			ingrB: this.ingrB.id,
			result: this.result.id,
		};
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

	toJSON() {
		return {
			handle: this.handle,
			id: this.id,
			emoji: this.emoji,
			dep: this.dep,
			can_craft: this.can_craft.map(x => x.id),
			craft_by: this.craft_by.map(x => x.id),
			craft_path_source: this.craft_path_source?.id,
		};
	}
}

const item_id_list = [], recipe_id_list = [];
const items_by_id = {}, recipes_by_id = {};

for (const item of all_items) {
	item_id_list.push(item.id);
	items_by_id[item.id] = new Item(item.id, item.handle, item.emoji);
}

for (const recipe of all_recipes) {
	recipe_id_list.push(recipe.id);
	const ingrA = items_by_id[recipe.ingrA_id];
	const ingrB = items_by_id[recipe.ingrB_id];
	const result = items_by_id[recipe.result_id];
	const r = new Recipes(recipe.id, ingrA, ingrB, result);
	recipes_by_id[recipe.id] = r;
	ingrA.addCanCraftRecipe(r);
	ingrB.addCanCraftRecipe(r);
	result.addCraftByRecipe(r);
}

const items_index_by_handle = {};
let NOTHING_ID = null;
for (const id of item_id_list) {
	const item = items_by_id[id];
	items_index_by_handle[item.handle] = item.id;
	if (item.isNothing()) {
		NOTHING_ID = item.id;
	}
}

let q = new PriorityQueue();
for (let i = 1; i <= 4; ++i) {
	items_by_id[i].dep = 0;
	q.push(i, 0);
}
items_by_id[NOTHING_ID].dep = 0;

while (!q.empty()) {
	let xid = q.pop()[0];
	let x = items_by_id[xid];

	for (const edge of x.can_craft) {
		const p = edge.ingrA.id == xid ? edge.ingrB : edge.ingrA;
		if (p.dep == -1) {
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

console.log(JSON.stringify({
	item_id_list,
	items_by_id,
	recipe_id_list,
	recipes_by_id,
	items_index_by_handle,
	NOTHING_ID,
}));

process.on('exit', () => db.close());
