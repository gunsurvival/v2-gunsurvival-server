const Config = require("../my_modules/config.js");
const Modes = require("./modes.js");
const Sprites = require("./sprites.js");
const Weapons = require("./weapons.js");
const _QuadTree = require("../my_modules/quadtree.js");
const Collides = require("p5collide");
const Convert = require("./convert.js");
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

export { Config, Modes, Sprites, Weapons, _QuadTree, Collides, Convert, Shuffle };
