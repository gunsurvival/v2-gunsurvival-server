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
	 * Delete all items in this.items
	 */
	clear() {
		this.items.splice(0, this.items.length);
	}

	/**
	 * @param  {Object} query - query object, if query is {} then it's will return this.top()
	 * @param  {Boolean} returnIndex - If true, will return index of item
	 * @return {Object} item - return item depend on query and options, if not found, return undefined or -1
	 */
	find(query, returnIndex) {
		const isObject = typeof options == "object";

		const indexFind = this.items.findIndex(item => {
			for (const property in query) {
				if (query[property] != item[property]) {
					return false;
				}
			}
			return true;
		});
		if (returnIndex) return indexFind;
		return this.items[indexFind];
	}

	/**
	 * @param {Object} item - An item object
	 */
	add(item, findQuery = {}) {
		// findQuery is a condition for checking duplicate of the item before adding
		if (Object.keys(findQuery).length != 0) {
			const index = this.find(findQuery, true);
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
		const itemIndex = this.find(queryObject, true);
		if (itemIndex != -1) this.items.splice(itemIndex, 1);
	}
}

export default Manager;
