import CircleSprite from "./CircleSprite.js";
import * as Matter from "matter-js";
import random from "random";

class Tree extends CircleSprite {
	constructor(config={}) {
		config = Matter.Common.extend({
		    name: "Tree",
		    matterBodyOption: {
		        circleRadius: 20,
		        isStatic: true
		    }
		}, config);
		super(config);

		const {
			hideCount = 0,
		} = config;

		this.hideCount = hideCount; // so vat the tron trong cai cay
	}

	update(queueAddSprites) {
		super.update(queueAddSprites);
	}

	getData() {
		return Object.assign(super.getData(), {
			hideCount: this.hideCount,
		});
	}
}

export default Tree;
