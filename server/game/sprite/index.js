import Sprite from "./Sprite.js";
import Tree from "./Tree.js";
import Rock from "./Rock.js";
import Animal from "./Animal.js";
import Bullet from "./Bullet.js";
import Score from "./Score.js";
import * as Human from "./human/";
import * as Bot from "./bot/";

export const SpriteClasses = {
	Sprite,
	Tree,
	Rock,
	Animal,
	Bullet,
	Score,
	...Human,
	...Bot,
};
