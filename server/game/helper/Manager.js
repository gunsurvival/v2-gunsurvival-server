class Manager {
	constructor() {
		this.items = [];
	}

	getLength() {
		return this.items.length;
	}

	top() {
		return this.items[0];
	}

	bottom() {
		return this.items[this.items.length - 1];
	}

	clear() {
		this.items.splice(0, this.items.length);
	}

	find(query, options) {
		const isObject = typeof options == "object";

		const returnIndex = Boolean(
			(isObject ? options.returnIndex : arguments[1]) || false
		);
		const slowReturn = Boolean(
			(isObject ? options.slowReturn : arguments[2]) || false
		);
		// nếu slowReturn bật bạn phải truyền vào biến query là chính object bạn cần tìm (ko phải shallow copy)
		const autoAdd = Boolean(
			(isObject ? options.autoAdd : arguments[3]) || false
		)

		const indexFind = this.items.findIndex(item => {
			const queries = slowReturn == false ? query : item;
			for (const property in queries) {
				if (query[property] != item[property]) {
					return false;
				}
			}
			return true;
		});
		if (indexFind == -1 && autoAdd) {
			this.add(query, false);
		}
		if (returnIndex) return indexFind;
		return this.items[indexFind];
	}

	add(item, checkDuplicate = true) {
		// addingCondition is a condition for checking duplicate of the item before adding
		if (checkDuplicate) {
			const index = this.find(item, true);
			if (index == -1) {
				this.items.push(item);
				return this.bottom();
			}
			return this.items[index];
		}
		this.items.push(item);
		return this.bottom();
	}

	delete(queryObject) {
		const itemIndex = this.find(queryObject, {
			returnIndex: true
		});
		if (itemIndex != -1) this.items.splice(itemIndex, 1);
	}
}

export default Manager;
