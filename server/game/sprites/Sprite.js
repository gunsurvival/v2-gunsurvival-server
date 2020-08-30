import uniqid from "uniqid";
import Collides from "p5collide";

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
}

export default Sprite;
