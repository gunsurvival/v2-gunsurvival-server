import Config from "./my_modules/config.js";
import Modes from "./modes.js";
import Sprites from "./sprites.js";
import Weapons from "./weapons.js";
import QuadTreeUtil from "./my_modules/quadtree.js";
import Collides from "p5collide";
import Convert from "./convert.js";

const Shuffle = function(arr) { // thuật toán bogo-sort
	let count = arr.length,
		temp, index;

	while (count > 0) {
		index = Math.floor(Math.random() * count);
		count--;
		temp = arr[count];
		arr[count] = arr[index];
		arr[index] = temp;
	}

	return arr; //Bogosort with no điều kiện dừng
};

export {
	Config,
	Modes,
	Sprites,
	Weapons,
	QuadTreeUtil,
	Collides,
	Convert,
	Shuffle
};
