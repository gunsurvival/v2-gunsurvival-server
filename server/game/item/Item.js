import {items} from "../helper/helperConfig.js";
import QueueDelay from "../helper/QueueDelay.js";

class Item {
	// constructor({ owner, name, round, reload, weight, delayHold, fire } = {}) {
	constructor({ownerID, name, id} = {}) {
		Object.assign(this, items[name]); // merge all prop into this item
		this.ownerID = ownerID;
		this.name = name;
		this.id = id;
		this.queueDelay = new QueueDelay();
		this.pick();
	}

	pick() {
		this.queueDelay.addDelay("pick", this.delay.pick);
	}

	isDelay() {
		return this.queueDeplay.items.length > 0;
	}

	update() {
		this.queueDelay.update(this);
	}

	onTrigger() {
		
	}
}

export default Item;
