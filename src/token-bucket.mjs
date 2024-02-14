export class Queue {
	constructor() {
		this.val = [];
		this.ptr = 0;
	}

	size() {
		return this.val.length - this.ptr;
	}

	get length() {
		return this.size();
	}

	empty() {
		return this.size() == 0;
	}

	front() {
		return this.val[this.ptr];
	}

	_rebuild() {
		if (this.ptr > 0) {
			this.val = this.val.slice(this.ptr);
			this.ptr = 0;
		}
	}

	popFront() {
		this.ptr += 1;
		if (this.ptr >= 16 && this.ptr >= this.val.length / 2) {
			this._rebuild();
		}
		return this;
	}

	pushBack(x) {
		this.val.push(x);
		return this;
	}
};

export class AsyncTokenBucket {
	constructor(limit) {
		this.wanted_by = new Queue();
		this.limit = limit;
		this.tokens_used = 0;
	}

	aquire() {
		if (this.tokens_used < this.limit) {
			this.tokens_used += 1;
			return Promise.resolve();
		}

		return new Promise((resolve, _reject) => this.wanted_by.pushBack(resolve));
	}

	refill() {
		if (this.tokens_used > 0) {
			this.tokens_used -= 1;
		}

		if (this.tokens_used < this.limit && !this.wanted_by.empty()) {
			this.tokens_used += 1;
			const resolve = this.wanted_by.front();
			this.wanted_by.popFront();
			resolve();
		}
	}
}
