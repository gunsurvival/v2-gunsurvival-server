import Animation from "../Animation.js";

export default class Middleware extends Animation {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Unknown Middleware Name",
				infinite: true,
				index: 0
			},
			config
		);
		super(config);
		this.middleware = true;
	}
}

export default Middleware;
