/**
 * Class representing like a array manager
 */
class Manager {
	/**
	 * @param  {Array} [items=[]] - List of item
	 */
	constructor(items = []) {
		this.items = items;
	}

	/**
	 * @return {Number} The length of this manager
	 */
	getLength() {
		return this.items.length;
	}

	/**
	 * @return {Object} Item with index 0 or undefined if length = 0
	 */
	top() {
		return this.items[0];
	}

	/**
	 * @return {Object} Item with the last index
	 */
	bottom() {
		return this.items[this.items.length - 1];
	}

	/**
	 * Clear all item in this manager
	 */
	clear() {
		this.items.splice(0, this.items.length);
	}

	/**
	 * @param  {Object} query - query object, if query is {} then it's will return this.top()
	 * @param  {Object} option - Option for querying
	 * @param  {Boolean} [option.returnIndex = false] - If true, then it will return index number instead of item object
	 * @return {Object} item - return item depend on finding query, if not found, return undefined or -1
	 */
	find(query, option) {
		const isObject = typeof option == "object";

		const returnIndex = Boolean(
			(isObject ? option.returnIndex : arguments[1]) || false
		);
		const slowReturn = Boolean(
			(isObject ? option.slowReturn : arguments[2]) || false
		);
		// nếu slowReturn bật bạn phải truyền vào biến query là chính object bạn cần tìm (ko phải shallow copy)
		const autoAdd = Boolean(
			(isObject ? option.autoAdd : arguments[3]) || false
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

	/**
	 * @param {Object} item - An item object
	 */
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

	/**
	 * @param  {Object} queryObject - query object, if query is {} then it's will return this.top()
	 */
	delete(queryObject) {
		const itemIndex = this.find(queryObject, {
			returnIndex: true
		});
		if (itemIndex != -1) this.items.splice(itemIndex, 1);
	}
}

export default Manager;
