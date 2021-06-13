import Animation from "../Animation.js";

export default class Sprite extends Animation {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Unknown Sprite"
			},
			config
		);
		super(config);
	}

	onCreate() {
		// socket update for on create
	}

	onUpdate() {
		// socket update
	}

	onDestroy() {
		// socket update for on destroy
	}

	update(sketch) {
		super.update(sketch);
	}
}
