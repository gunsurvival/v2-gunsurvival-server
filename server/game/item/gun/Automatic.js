import randomNormal from "random-normal";
import * as Spritet from "../../sprite/";
import {degreesToRadians} from "../../helper/helper.js";
import Gun from "./Gun.js";

/**
 * A class representing automatic gun such as: ak47, m4a1, m249
 */
class Automatic extends Gun {
	/**
	 * Create new Automatic gun
	 * @param  {Object} config
	 */
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

	getCurrentState(owner) {
		let status = "running";
		if (!owner.status.moving) status = "staying";
		else if (owner.keyDown["shift"])
			// walking
			status = "walking";
		return status;
	}

	update(queueAddSprites, owner) {
		super.update(queueAddSprites);
		if (
			owner.logkmManager.find({
				mouseButton: "left",
				value: true
			}) &&
			!this.isDelay() &&
			this.bulletCount > 0
		) {
			this.addDelay("fire");

			const noise = randomNormal({
				mean: 0,
				dev: (Math.PI / 180) * (this.dev[this.getCurrentState(owner)] / 4)
			});

			const radian = degreesToRadians(owner.degree);
			const dx = Math.cos(radian); // default speed x, y for get starPos of bulconst
			const dy = Math.sin(radian);
			const magDefault = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			const scaleDefault = 20 / magDefault;
			const startPos = {
				// vị trí bắn ở đầu nhân vật
				x: owner.pos.x + dx * scaleDefault,
				y: owner.pos.y + dy * scaleDefault
			};

			const radianSpeed = radian + noise;
			const sx = Math.cos(radianSpeed); // nx means noised position x
			const sy = Math.sin(radianSpeed);
			const magSpeed = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
			const scaleSpeed = this.speed / magSpeed; // scale cho cái speed = bulconstconfig>speed
			const speedVector = {
				// vector speed đạn
				x: sx * scaleSpeed,
				y: sy * scaleSpeed
			};

			room.addObject(
				"bullets",
				new Sprite.Bullet({
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
