import CircleSprite from "./CircleSprite.js";
import * as Matter from "matter-js";
import random from "random";

class Rock extends CircleSprite {
	constructor(config) {
		config = Object.assign(
			{
				name: "Rock"
			},
			config
		);
		super(config);

		const {
			matterBodyOption = {}
		} = config;

		this._matterBodyOption = Object.assign({
            circleRadius: 90,
            isStatic: true
        }, matterBodyOption);
        this.matterBody = Matter.Bodies.circle(0, 0, this._matterBodyOption.circleRadius, this._matterBodyOption);
	}

	update() {
		super.update();
	}

	getData() {
		return Object.assign(super.getData(), {
			// idk
		});
	}
}

export default Rock;
