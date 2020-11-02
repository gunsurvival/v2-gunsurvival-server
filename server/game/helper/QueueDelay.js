import Manager from "./Manager.js";

class QueueDelay extends Manager {
	constructor() {
		super();
	}

	addDelay(name, frame=0, callback) {
		this.add({
			name,
			frame,
			callback
		});
	}

	update(item) {
		const delay = this.top();
		if (delay) {
			// console.log(delay)
			delay.frame--;
			if (delay.frame <= 0) {
				if (delay.callback)
					delay.callback(item);
				this.delete(delay);
			}
		}
	}
}

export default QueueDelay;