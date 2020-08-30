import Human from "./Human.js";

class Terrorist extends Human {
	constructor(config) {
		super(config);
		this.img = "terrorist";
	}
}

export default Terrorist;
