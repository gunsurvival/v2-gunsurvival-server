import Sprite from "./Sprite.js";
import * as Matter from "matter-js";
import random from "random";

class Rock extends Sprite {
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
            circleRadius: 90
        }, matterBodyOption);
        this.matterBody = Matter.Bodies.circle(0, 0, this._matterBodyOption.circleRadius, this._matterBodyOption);
        Matter.Body.setMass(this.matterBody, 1000000);
        // console.log(this.matterBody)
	}

	getScale() {
		const scale = this.matterBody.circleRadius / this._matterBodyOption.circleRadius;
		this._scale = scale;
		return scale;
	}

	update() {
		super.update();
	}

	getData() {
		return Object.assign(super.getData(), {
			_circleRadius: this._circleRadius,
		});
	}
}

export default Rock;
