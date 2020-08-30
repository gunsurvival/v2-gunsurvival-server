import Sprite from "./Sprite.js";
import Animal from "./Animal.js";
import Bullet from "./Bullet.js";
import Score from "./Score.js";
import * as Humans from "./humans";

const Sprites = {
	Sprite,
	Animal,
	Bullet,
	Score,
	...Humans
};

export default Sprites;
