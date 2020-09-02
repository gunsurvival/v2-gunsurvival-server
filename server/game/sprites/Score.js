import Sprite from "./Sprite.js";
import * as Matter from "matter-js";
import random from "random";

class Score extends Sprite {
	constructor(config) {
		config = Object.assign(
			{
				name: "Score"
			},
			config
		);
		super(config);
		this._value = 10; // default value
		const {value = this._value, matterBodyConfig = {
			position: {
				x: 1,
				y: 1
			},
			circleRadius: this._value,
		}} = config;
		this.value = value;
		const mbc = matterBodyConfig; // use short name
		this.matterBody = Matter.Bodies.circle(
			1,
			1,
			1,
			mbc
		);
	}

	getScale() {
		return this.value / this._value;
	}

	getSpeed() {
		return (this._value / this.value) * 1;
	}

	update() {
		// debugger;
		const scale = this.getScale();
		Matter.Body.scale(this.matterBody, scale, scale);
		const speed = this.getSpeed();
		const crPos = this.matterBody.position; // current position
		// console.log(this.matterBody.velocity);
		// console.log(random.float(-speed, speed));
		Matter.Body.set(this.matterBody, {
			velocity: {
				x: this.matterBody.velocity.x + random.float(-speed, speed),
				y: this.matterBody.velocity.y + random.float(-speed, speed)
			}
		})
		// debugger;
		// Matter.Body.set(this.matterBody, {
		// 	position: {
		// 		x: crPos.x + random.float(-speed, speed),
		// 		y: crPos.y + random.float(-speed, speed)
		// 	}
		// });
	}

	collide(object) {
		switch (object.origin.type) {
			case "Rock": {
				let vectorRockMe = {
					x: this.pos.x - object.origin.pos.x,
					y: this.pos.y - object.origin.pos.y
				};
				let magNewVector = Math.sqrt(
					Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2)
				);
				let bulletSpeed = Math.sqrt(
					Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2)
				);
				let scale = bulletSpeed / magNewVector;
				let bounceFriction = 0.7;
				this.speed.x = vectorRockMe.x * scale * bounceFriction;
				this.speed.y = vectorRockMe.y * scale * bounceFriction;
				break;
			}
			case "Human":
				this.delete = true;
				break;
			case "Score":
			case "Bullet": {
				let newSpeed = {
					x: (object.copy.speed.x / 100) * 80,
					y: (object.copy.speed.y / 100) * 80
				};
				this.speed.x = newSpeed.x;
				this.speed.y = newSpeed.y;
				break;
			}
		}
	}

	getData() {
		const defaultData = super.getData();
		const { position } = this.matterBody;
		return Object.assign(defaultData, {
			position,
			value: this.value,
			_value: this._value,
		});
	}
}

export default Score;
