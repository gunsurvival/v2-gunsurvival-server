import uniqid from "uniqid";

class Sprite {
	// getQueryRange ko can truyen cung duoc
	constructor({name, id = uniqid(), frameCount = 0} = {}) {
		this.name = name;
		this.id = id;
		this.matterBody; // *
		this.frameCount = frameCount;
	}

	update() {
		this.frameCount++;
	}

	draw() {
		// idk waht i shoud put here
	}

	getData() {
		// generate data for emitting
		return {
			id: this.id,
			name: this.name,
			frameCount: this.frameCount,
		}
	}
}

export default Sprite;
