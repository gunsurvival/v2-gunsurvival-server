import Sprite from "./Sprite.js";
import * as Matter from "matter-js";
import random from "random";

class Tree extends Sprite {
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
            mass: 1000
        }, matterBodyOption);
        this.matterBody = Matter.Bodies.circle(0, 0, this._matterBodyOption.circleRadius, this._matterBodyOption);
		this.hideCount = hideCount; // so vat the tron trong cai cay

	}

	getScale() {
		const scale = this.matterBody.circleRadius / this._circleRadius;
		this._scale = scale;
		return scale;
	}

	update() {
		super.update();
	}

	getData() {
		return Object.assign(super.getData(), {
			hideCount: this.hideCount,
			_circleRadius: this._circleRadius,
		});
	}
}

export default Tree;
