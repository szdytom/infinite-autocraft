export class PriorityQueue {
	constructor() {
		this.val = [null];
	}

	push(value, priority) {
		if (priority == null) {
			priority = value;
		}

		this.val.push([value, priority]);
		let id = this.val.length - 1;
		while (id > 1 && this.val[id][1] > this.val[id >>> 1][1]) {
			const kid = id >>> 1;
			[this.val[id], this.val[kid]] = [this.val[kid], this.val[id]];
			id = kid;
		}
		return this;
	}

	pop() {
		let lv = this.val.pop();
		if (this.val.length == 1) { return lv; }

		let res = this.val[1];
		this.val[1] = lv;
		let id = 1;
		while (id * 2 < this.val.length) {
			if (this.val[id][1] > this.val[id * 2][1] && (id * 2 + 1 >= this.val.length || this.val[id][1] > this.val[id * 2 + 1][1])) {
				break;
			}

			let kid = (id * 2 + 1 >= this.val.length || this.val[id * 2][1] > this.val[id * 2 + 1][1]) ? id * 2 : id * 2 + 1;
			[this.val[id], this.val[kid]] = [this.val[kid], this.val[id]];
			id = kid;
		}
		return res;
	}

	top() {
		return this.val[1];
	}

	size() {
		return this.val.length - 1;
	}

	empty() {
		return this.size() == 0;
	}
}
