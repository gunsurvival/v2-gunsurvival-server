import Sprite from "./Sprite.js";
import * as Matter from "matter-js";
import {realSize, fixedSize} from "../helper/helperConfig.js";

class Bullet extends Sprite {
	constructor(config) {
		config = Object.assign(
			{
				name: "Bullet"
			},
			config
		);
		super(config);
		const {ownerID, matterBodyConfig} = config;
		this.ownerID = ownerID;
		const mbc = matterBodyConfig;
		this.matterBody = Matter.Bodies.circle(
			mbc.position.x,
			mbc.position.y,
			mbc.circleRadius,
			mbc
		);
	}

	getBoundary() {
		let bRadius =
			realSize[this.imgName] * this.size - fixedSize[this.imgName];
		let px = this.pos.x - this.speed.x; // previous position
		let py = this.pos.y - this.speed.y;
		let cx = this.pos.x; // current position
		let cy = this.pos.y;

		let vectorO1O2 = this.speed; // vector chỉ phương tương đương với vector tốc độ đạn
		let vectorAB = {
			// vector pháp tuyến
			x: -vectorO1O2.y,
			y: vectorO1O2.x
		};
		let magAB = Math.sqrt(
			Math.pow(vectorAB.x, 2) + Math.pow(vectorAB.y, 2)
		); // length của vector pháp tuyến
		let scale = bRadius / 2 / magAB; // scale để length của vector pháp tuyến = x length
		let A = {
				x: vectorAB.x * scale + px,
				y: vectorAB.y * scale + py
			},
			B = {
				x: -vectorAB.x * scale + px,
				y: -vectorAB.x * scale + py
			},
			C = {
				x: -vectorAB.x * scale + cx,
				y: -vectorAB.x * scale + cy
			},
			D = {
				x: vectorAB.x * scale + cx,
				y: vectorAB.y * scale + cy
			};

		return {
			type: "Poly",
			data: [[A, B, C, D]]
		};
	}

	collide(object) {
		switch (object.origin.type) {
			case "Human":
				if (object.origin.id != this.ownerID) {
					// neu nguoi do ko phai la minh
					this.speed.x *= 0.4; // giam speed dan sau khi tinh dame
					this.speed.y *= 0.4;
				}
				break;
			case "Bullet":
			case "Score": {
				let newSpeed = {
					x: (object.copy.speed.x / 100) * 80,
					y: (object.copy.speed.y / 100) * 80
				};
				this.speed.x = newSpeed.x;
				this.speed.y = newSpeed.y;
				break;
			}
			case "Tree":
				this.speed.x *= 0.8;
				this.speed.y *= 0.8;
				break;
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
		}
	}

	update(queueAddSprites) {
		super.update(queueAddSprites);
		if (this.delete) return;

		if (
			Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2)) <=
			0.1
		) {
			this.delete = true;
		}
	}
}

export default Bullet;
