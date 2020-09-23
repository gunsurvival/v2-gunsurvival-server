import Manager from "../../helper/Manager.js";

/**
 * Class representing a human's bag
 */
class Bag extends Manager {
	constructor(config) {
		super();
		const {
			maxCapacity = 5
		} = config;
		this.currentIndex = 0;
		this.maxCapacity = maxCapacity;
	}

	/**
	 * @return {Object}
	 */
	getCurrentItem() {
		if (this.items.length > 0)
		return this.items[this.currentIndex];
	}

	/**
	 * @param  {Array}
	 */
	updateBag(items) {
		this.clear();
		for (const item of items) {
			this.add(item)
		}
		if (items.length == 0)
			this.currentIndex = -1;
	}
}