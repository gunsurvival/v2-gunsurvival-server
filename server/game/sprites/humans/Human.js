import Player from "./Player.js";

class Human extends Player {
	constructor(config) {
		config.type = "Human";
		super(config);
		let {bag} = config;
		this.bag = bag;
		this.blood = 100;
		this.killerID = "";
		this.holdingCoolDown = 0;
		this.status = {};
		this.lastPos = {
			x: this.pos.x,
			y: this.pos.y
		};

		this.directions = ["up", "down", "left", "right"];
	}

	getMovingSpeed() {
		let speed = 7;
		let holdingGun = this.bag.arr[this.bag.index];
		speed -= holdingGun.weight;

		if (this.mouseDown["left"])
			// do somthing with mouse left button
			speed--;

		if (this.keyDown["shift"])
			// walking
			speed *= 5 / 10;

		if (speed <= 1) speed = 1;

		return speed / this.size; //normal
	}

	isDead() {
		return this.blood <= 0;
	}

	update(room) {
		super.update(room);

		if (this.isDead()) {
			this.blood = 0;
			return;
		}

		this.lastPos.x = this.pos.x;
		this.lastPos.y = this.pos.y;
		this.size = this.blood / 100;
		if (this.size > 2) this.size = 2;
		if (this.size < 0.5) this.size = 0.5;
		this.status.hideInTree = false;
		this.status.moving = false;

		super.update(room); // update position

		let item = this.bag.arr[this.bag.index];
		item.update(room);
		// if ()
	}

	collide(object) {
		switch (object.origin.type) {
			case "Bullet":
				if (this.id != object.origin.ownerID) {
					let bulletSpeed = Math.sqrt(
						Math.pow(object.copy.speed.x, 2) +
							Math.pow(object.copy.speed.y, 2)
					); // bullet speed
					let defaultSpeed = 200; // bullet default speed to kill someone, reach this, will make 100 damage
					// let defaultRange = 16;
					let damage =
						100 *
						(bulletSpeed / defaultSpeed) *
						(object.origin.getQueryRange() / 20); // damage chia 2 vi eo hieu sao no bi dinh dan 2 lan :(
					this.blood -= Math.round(damage);
					if (this.blood < 0) {
						this.blood = 0;
						this.killerID = object.origin.ownerID;
					}
				}
				break;
			case "Tree":
				this.status.hideInTree = true;
				break;
			case "Human": {
				let vectorHimMe = {
					x: this.pos.x - object.copy.pos.x,
					y: this.pos.y - object.copy.pos.y
				};
				let mag = Math.sqrt(
					Math.pow(vectorHimMe.x, 2) + Math.pow(vectorHimMe.y, 2)
				);
				let newMag =
					(object.origin.getQueryRange() + this.getQueryRange()) / 2;
				let scaleMag = newMag / mag;
				this.pos.x = vectorHimMe.x * scaleMag + object.copy.pos.x;
				this.pos.y = vectorHimMe.y * scaleMag + object.copy.pos.y;
				break;
			}
			case "Rock": {
				let vectorRockMe = {
					x: this.pos.x - object.origin.pos.x,
					y: this.pos.y - object.origin.pos.y
				};
				let mag = Math.sqrt(
					Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2)
				);
				let newMag =
					(object.origin.getQueryRange() + this.getQueryRange()) / 2;
				let scaleMag = newMag / mag;
				this.pos.x = vectorRockMe.x * scaleMag + object.origin.pos.x;
				this.pos.y = vectorRockMe.y * scaleMag + object.origin.pos.y;
				break;
			}
			case "Score":
				this.blood += object.copy.value;
				break;
		}
	}
}

export default Human;
