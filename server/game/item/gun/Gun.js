import Item from "../Item.js";

class Gun extends Item {
	constructor(config) {
		super(config);
		const {bulletCount, magazine} = config;
		this.bulletCount = bulletCount;
		this.magazine = magazine;
	}

	reloadBullet() {
		this.addDelay("reload");
	}
}

export default Gun;
