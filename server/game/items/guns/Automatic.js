import randomNormal from "random-normal";
import Sprites from "../../sprites";
import {degreesToRadians} from "../../helper/helper.js";
import Gun from "./Gun.js";

class Automatic extends Gun {
	constructor(config) {
		super(config);
	}

	take() {
		super.take();
		if (this.bulletCount <= 0) {
			this.reloadBullet();
		}
	}

	isReloading() {
		return this.queueDelay.findIndex(e => e.name == "reload") != -1;
	}

	update(room) {
		super.update(room);
		let owner = room.findObject("gunners", this.ownerID);
		if (!owner) return;
		if (
			owner.mouseDown["left"] &&
			!this.isDelay() &&
			this.bulletCount > 0
		) {
			this.addDelay("fire");

			let status = "running";
			if (!owner.status.moving) status = "staying";
			else if (owner.keyDown["shift"])
				// walking
				status = "walking";

			let noise = randomNormal({
				mean: 0,
				dev: (Math.PI / 180) * (this.dev[status] / 4)
			});

			let radian = degreesToRadians(owner.degree);
			let dx = Math.cos(radian); // default speed x, y for get starPos of bullet
			let dy = Math.sin(radian);
			let magDefault = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			let scaleDefault = 20 / magDefault;
			let startPos = {
				// vị trí bắn ở đầu nhân vật
				x: owner.pos.x + dx * scaleDefault,
				y: owner.pos.y + dy * scaleDefault
			};

			let radianSpeed = radian + noise;
			let sx = Math.cos(radianSpeed); // nx means noised position x
			let sy = Math.sin(radianSpeed);
			let magSpeed = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
			let scaleSpeed = this.speed / magSpeed; // scale cho cái speed = bulletconfig>speed
			let speedVector = {
				// vector speed đạn
				x: sx * scaleSpeed,
				y: sy * scaleSpeed
			};

			room.addObject(
				"bullets",
				new Sprites.Bullet({
					id: Date.now(),
					type: this.name,
					name: this.name,
					pos: startPos,
					defaultRange: 25,
					size: this.size,
					ownerID: owner.id,
					speed: speedVector, //vector bullet go
					friction: this.friction,
					imgName: this.imgName
				})
			);
			this.bulletCount--;
		} else {
			if (this.bulletCount <= 0 && !this.isReloading()) {
				this.reloadBullet();
				console.log(this.queueDelay);
			}
		}
	}
}

export default Automatic;
