import CircleSprite from "./CircleSprite.js";
import * as Matter from "matter-js";
import random from "random";

class Rock extends CircleSprite {
	constructor(config) {
		config = Matter.Common.extend({
			name: "Rock",
			matterBodyOption: {
				circleRadius: 90,
				isStatic: true
			}
		}, config);
		super(config);

		const {
			matterBodyOption
		} = config;
		this._matterBodyOption = matterBodyOption;
        this.matterBody = Matter.Bodies.circle(0, 0, this._matterBodyOption.circleRadius, this._matterBodyOption);
	}

	update(queueAddSprites) {
		super.update(queueAddSprites);
	}

	getData() {
		return Object.assign(super.getData(), {
			// idk
		});
	}
}

export default Rock;
