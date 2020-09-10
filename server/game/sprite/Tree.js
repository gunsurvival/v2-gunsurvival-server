import CircleSprite from "./CircleSprite.js";
import * as Matter from "matter-js";
import random from "random";

class Tree extends CircleSprite {
	constructor(config) {
		config = Object.assign(
			{
				name: "Tree"
			},
			config
		);
		super(config);

		const {
			matterBodyOption = {},
			hideCount = 0,
		} = config;

		this._matterBodyOption = Object.assign({
            circleRadius: 20,
            isStatic: true
        }, matterBodyOption);
        this.matterBody = Matter.Bodies.circle(0, 0, this._matterBodyOption.circleRadius, this._matterBodyOption);
		this.hideCount = hideCount; // so vat the tron trong cai cay
	}

	update() {
		super.update();
	}

	getData() {
		return Object.assign(super.getData(), {
			hideCount: this.hideCount,
		});
	}
}

export default Tree;
