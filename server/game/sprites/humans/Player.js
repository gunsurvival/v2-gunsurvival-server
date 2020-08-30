import Sprite from "../Sprite.js";
import {keyBind} from "../../helper/helperConfig.js";

class Player extends Sprite {
	constructor(config) {
		super(config);
		this.keyDown = {};
		this.mouseDown = {};
	}

	update(room) {
		super.update(room);

		let movingVector = {
			x: 0,
			y: 0
		};
		let movingSpeed = this.getMovingSpeed();
		for (let direction of this.directions) {
			// check all valid direction
			let key = keyBind[direction]; // get key in keyboard config
			if (this.keyDown[key]) {
				// if that key is press-down
				this.status.moving = true;
				switch (direction) {
					case "up":
						movingVector.y -= movingSpeed;
						break;
					case "down":
						movingVector.y += movingSpeed;
						break;
					case "left":
						movingVector.x -= movingSpeed;
						break;
					case "right":
						movingVector.x += movingSpeed;
						break;
				}
			}
		}
		let magMovingVector = Math.sqrt(
			Math.pow(movingVector.x, 2) + Math.pow(movingVector.y, 2)
		);
		let scale = 1;
		if (magMovingVector > 0) scale = movingSpeed / magMovingVector;
		movingVector.x *= scale;
		movingVector.y *= scale;
		this.pos.x += movingVector.x;
		this.pos.y += movingVector.y;
	}

	onKeyDown(key) {
		this.keyDown[key] = true;
	}

	onKeyUp(key) {
		this.keyDown[key] = false;
	}

	onMouseDown(button) {
		this.mouseDown[button] = true;
	}

	onMouseUp(button) {
		this.mouseDown[button] = false;
	}
}

export default Player;
