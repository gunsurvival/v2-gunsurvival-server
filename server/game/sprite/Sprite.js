import uniqid from "uniqid";
import * as Matter from "matter-js";

class Sprite {
	// getQueryRange ko can truyen cung duoc
	constructor({name, id = uniqid(), frameCount = 0} = {}) {
		this.name = name;
		this.id = id;
		this.matterBody; // *
		this.frameCount = frameCount;
		this.deleted = false;
	}

	update() {
		this.frameCount++;
		const scale = this.getScale();
		if (scale != this._scale) // neu khac scale truoc do thi moi scale (optimize)
			Matter.Body.scale(this.matterBody, scale, scale);
	}

	getScale() {
		const scale = 1;
		this._scale = scale;
		return scale;
	}

	getData() {
		// generate data for emitting
		const { position, angle } = this.matterBody;
		return {
			id: this.id,
			name: this.name,
			frameCount: this.frameCount,
			pos: position,
			rotate: angle
		}
	}

	delete() {
		this.deleted = true;
	}
}

export default Sprite;
