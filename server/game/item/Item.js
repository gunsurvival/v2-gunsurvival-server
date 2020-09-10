import {items} from "../helper/helperConfig.js";

class Item {
	// constructor({ owner, name, round, reload, weight, delayHold, fire } = {}) {
	constructor({ownerID, name, id} = {}) {
		Object.assign(this, items[name]);
		this.id = id;
		this.delay = 0;
		this.name = name;
		this.queueDelay = [];
		this.ownerID = ownerID;
		this.take();
	}

	isDelay() {
		return this.delay > 0;
	}

	take() {
		this.queueDelay = [
			{
				name: "hold",
				callback: null
			}
		];
	}

	addDelay(name, callback) {
		this.queueDelay.push({
			name,
			callback
		});
	}

	update() {
		if (this.isDelay()) {
			this.delay--;
		} else {
			if (this.queueDelay.length > 0) {
				let newDelayData = this.queueDelay.splice(0, 1);
				this.delay = this[newDelayData.name];
			}
		}
	}
}

export default Item;
