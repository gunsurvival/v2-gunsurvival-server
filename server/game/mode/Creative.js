import { SpriteClasses as Sprite } from "../sprite/"; // all sprite classes
import Game from "./Game.js";

class Creative extends Game {
	constructor(config={}) {
		super(config);
		this.mode = "Creative";
		this.createMap("random");
		this.addSprite(new Sprite.Mitsuku());
	}
}

export default Creative;
