import Item from "../Item.js";

class Gun extends Item {
	constructor(config={}) {
		super(config);
		const {bulletCount = this.round, magazine = 1} = config;
		this.bulletCount = bulletCount;
		this.magazine = magazine;
	}

	reloadBullet() {
		this.queueDelay.addDelay("reload", this.delay.reload, (gun) => {
			gun.bulletCount = gun.round;
			gun.magazine--;
		});
	}

	isReloading() {
		const index = this.queueDelay.find({
			name: "reload"
		}, true);
		return index != -1;
	}
}

export default Gun;
