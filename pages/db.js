import { Queue } from '../src/token-bucket.mjs';
import { BinaryTransferData } from '../src/data-typedef.mjs';
import { deserializeFromBinary } from 'binary-struct';

// Due to some strange problems
// Comment this line if debugging with `parcel serve`
import { decompress } from '@cloudpss/zstd';

async function downloadRawData() {
	if (process.env.NODE_ENV === 'development') {
		const response = await fetch(new URL('../craft.dat', import.meta.url));
		const raw = await response.arrayBuffer();
		return raw;
	}
	const response = await fetch(new URL('../craft.dat.zst', import.meta.url));
	const raw = await response.arrayBuffer();
	return decompress(raw).buffer;
}

let NOTHING_ID;
const items_by_id = new Map(), recipes_by_id = new Map();
const items_index_by_handle = new Map();
const item_id_list = [], recipes_id_list = [];

export async function initialize() {
	const raw_data = await downloadRawData();
	const adata = deserializeFromBinary(new DataView(raw_data), BinaryTransferData);

	NOTHING_ID = adata.NOTHING_ID;
	for (const b of adata.items) {
		item_id_list.push(b.id);
		items_index_by_handle.set(b.handle, b.id);
		b._can_craft = [];
		b._craft_by = [];
		items_by_id.set(b.id, b);
	}

	for (const b of adata.recipes) {
		recipes_id_list.push(b.id);
		recipes_by_id.set(b.id, b);
		items_by_id.get(b.ingrA_id)._can_craft.push(b.id);
		if (b.ingrA_id != b.ingrB_id) {
			items_by_id.get(b.ingrB_id)._can_craft.push(b.id);
		}
		items_by_id.get(b.result_id)._craft_by.push(b.id);
	}

	Item.count = adata.items.length;
	Recipes.count = adata.recipes.length;
}

export class Recipes {
	constructor({id, ingrA, ingrB, result}) {
		this.id = id;
		this.ingrA = ingrA;
		this.ingrB = ingrB;
		this.result = result;
	}

	static recipes_loaded = new Map();
	static count = 0;

	static loadById(id) {
		if (id == 0 || !recipes_by_id.has(id)) {
			return null;
		}

		if (this.recipes_loaded.has(id)) {
			return this.recipes_loaded.get(id);
		}

		const {ingrA_id, ingrB_id, result_id} = recipes_by_id.get(id);
		const res = new Recipes({
			id,
			ingrA: Item.loadById(ingrA_id),
			ingrB: Item.loadById(ingrB_id),
			result: Item.loadById(result_id),
		});
		this.recipes_loaded.set(id, res);
		return res;
	}
}

export class Item {
	constructor({id, handle, emoji, _can_craft, _craft_by, dep, _craft_path_source}) {
		this.id = id;
		this.handle = handle;
		this.emoji = emoji;
		this._can_craft = _can_craft;
		this._craft_by = _craft_by;
		this._craft_path_source = _craft_path_source;
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

	note() {
		if (this.id == NOTHING_ID) {
			return 'This element is only used to indicate the result of elements that don\'t craft, you cannot actually craft this element in game.';
		}
		return null;
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

	static count = 0;

	static items_loaded = new Map();

	static loadById(id) {
		if (this.items_loaded.has(id)) {
			this.items_loaded.get(id);
		}

		const {handle, emoji, _can_craft, _craft_by, dep, _craft_path_source} = items_by_id.get(id);
		const res = new Item({
			id, handle, emoji, dep,
			_can_craft,
			_craft_by,
			_craft_path_source,
		});
		this.items_loaded.set(id, res);
		return res;
	}

	static loadByHandle(handle) {
		const id = items_index_by_handle.get(handle);
		if (id == null) {
			return null;
		}

		return this.loadById(id);
	}

	static getRandomHandle() {
		const v = Math.floor(Math.random() * this.count);
		const id = item_id_list[v];
		return items_by_id.get(id).handle;
	}

	static findByHandleContains(keyword) {
		keyword = keyword.toLowerCase();
		let matches = [];
		for (let id of item_id_list) {
			const row = items_by_id.get(id);
			const handle = row.handle.toLowerCase();
			if (handle.includes(keyword)) {
				matches.push(row);
			}
		}

		matches.sort((a, b) => {
			if (a.handle.length < b.handle.length) { return -1; }
			if (a.handle.length > b.handle.length) { return 1; }
			return 0;
		});
		return matches.map(r => Item.loadById(r.id));
	}
}
