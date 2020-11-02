import randomNormal from "random-normal";
import {SpriteClasses as Sprite} from "../../sprite/index.js";
import Gun from "./Gun.js";

/**
 * A class representing automatic gun such as: ak47, m4a1, m249
 */
class Automatic extends Gun {
	/**
	 * Create new Automatic gun
	 * @param  {Object} config
	 */
	constructor(config={}) {
		super(config);
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
			})
		) {
			if (this.bulletCount > 0 && this.queueDelay.items.length == 0) {
				this.queueDelay.addDelay("fire", this.delay.fire);
				const state = this.getCurrentState(owner);
				const noise = randomNormal({
					mean: 0,
					dev: (Math.PI / 180) * (this.dev[state] / 4)
				});
				const radian = owner.matterBody.angle;
				const dx = Math.cos(radian); // default speed x, y for get starPos of bulconst
				const dy = Math.sin(radian);
				const magDefault = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
				const scaleDefault = 80 / magDefault;
				const startPos = {
					// vị trí bắn ở đầu nhân vật
					x: owner.matterBody.position.x + dx * scaleDefault,
					y: owner.matterBody.position.y + dy * scaleDefault
				};
				const radianSpeed = radian + noise;
				const sx = Math.cos(radianSpeed); // nx means noised position x
				const sy = Math.sin(radianSpeed);
				const force = {
					x: sx,
					y: sy
				};
				const velocity = {
					x: sx * 100,
					y: sy * 100
				}
				startPos.x -= velocity.x;
				startPos.y -= velocity.y;
				queueAddSprites.push(
					new Sprite.Bullet({
						ownerID: owner.id,
						matterBodyConfig: {
							position: startPos,
							circleRadius: 25,
						},
						velocity
					})
				);
			}
		} else {
			if (this.bulletCount <= 0 && !this.isReloading()) {
				this.reloadBullet();
			}
		}
	}
}

export default Automatic;
