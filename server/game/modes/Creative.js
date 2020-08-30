import Game from "./Game.js";

class Creative extends Game {
	constructor(config) {
		super(config);
		this.mode = "Creative";
		this.createMap("random");
	}
}

export default Creative;
