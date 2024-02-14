import * as data from './data.json';
import { Queue } from '../src/token-bucket.mjs';

export class Recipes {
	constructor({id, ingrA, ingrB, result}) {
		this.id = id;
		this.ingrA = ingrA;
		this.ingrB = ingrB;
		this.result = result;
	}

	static recipes_loaded = new Map();

	static loadById(id) {
		if (this.recipes_loaded.has(id)) {
			return this.recipes_loaded.get(id);
		}

		const {ingrA, ingrB, result} = data.recipes_by_id[id];
		const res = new Recipes({
			id,
			ingrA: Item.loadById(ingrA),
			ingrB: Item.loadById(ingrB),
			result: Item.loadById(result),
		});
		this.recipes_loaded.set(id, res);
		return res;
	}
}

export class Item {
	constructor({id, handle, emoji, can_craft, craft_by, dep, craft_path_source}) {
		this.id = id;
		this.handle = handle;
		this.emoji = emoji;
		this._can_craft = can_craft;
		this._craft_by = craft_by;
		this._craft_path_source = craft_path_source;
		this.dep = dep;
	}

	get can_craft() {
		return this._can_craft.map(x => Recipes.loadById(x));
	}

	get craft_by() {
		return this._craft_by.map(x => Recipes.loadById(x));
	}

	get craft_path_source() {
		return Recipes.loadById(this._craft_path_source);
	}

	isFundamental() {
		return this.dep == 0;
	}

	calcPath() {
		if (this.isFundamental()) {
			return [];
		}

		let q = new Queue();
		let vis = new Set(), res = [];
		q.pushBack(this.craft_path_source);
		while (q.size()) {
			let x = q.front();
			q.popFront();
			if (vis.has(x.id)) {
				continue;
			}
			vis.add(x.id);
			res.push([x.id, x.result.dep]);
			if (x.ingrA.dep != 0) {
				q.pushBack(x.ingrA.craft_path_source);
			}

			if (x.ingrB.dep != 0) {
				q.pushBack(x.ingrB.craft_path_source);
			}
		}

		res.sort((a, b) => {
			if (a[1] < b[1]) { return -1; }
			if (a[1] > b[1]) { return 1; }
			return 0;
		});
		let ans = [];
		for (const id of res) {
			ans.push(Recipes.loadById(id[0]));
		}
		return ans;
	}

	toString() {
		return this.handle;
	}

	static items_loaded = new Map();

	static loadById(id) {
		if (this.items_loaded.has(id)) {
			this.items_loaded.get(id);
		}

		const {handle, emoji, can_craft, craft_by, dep, craft_path_source} = data.items_by_id[id];
		const res = new Item({
			id, handle, emoji, dep,
			can_craft,
			craft_by,
			craft_path_source,
		});
		this.items_loaded.set(id, res);
		return res;
	}

	static loadByHandle(handle) {
		const id = data.items_index_by_handle[handle];
		if (id == null) {
			return null;
		}

		return this.loadById(id);
	}
}
