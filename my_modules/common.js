const MY_MODULE_DIR = `${__dirname}/`;
const collide = require(`${MY_MODULE_DIR}p5.collide.js`);
const {
	ITEM_CONFIG,
	REAL_SIZE,
	MINUS_SIZE
} = require(`${MY_MODULE_DIR}config.js`);

module.exports = {

	REAL_SIZE,
	MINUS_SIZE,
	ITEM_CONFIG,

	degreesToRadians: function (degrees) {
		return degrees * (Math.PI / 180);
	},

	radiansToDegrees: function (radians) {
		return radians * (180 / Math.PI);
	},

	movingSpeed: function (object) { // object here means gunner me
		let speed = 7;
		speed -= ITEM_CONFIG[object.bag.arr[object.bag.index].name].weight;
		if (object.keydown["shift"])
			speed *= 5 / 10;
		if (object.firing)
			speed--;
		if (speed <= 1)
			speed = 1;
		return speed; //normal
	},

	checkCollide: function (circlePos, radius, object) { // object = map[i]
		let real = REAL_SIZE[object.type];
		let minus = MINUS_SIZE[object.type];
		switch (object.type) {
		case "Bullet": {
			let bRadius = REAL_SIZE[ITEM_CONFIG[object.name].imgName] * ITEM_CONFIG[object.name].size - MINUS_SIZE[ITEM_CONFIG[object.name].imgName];
			let px = object.pos.x - object.speed.x; // previous position
			let py = object.pos.y - object.speed.y;
			let cx = object.pos.x; // current position
			let cy = object.pos.y;

			let vectorO1O2 = object.speed; // vector chỉ phương tương đương với vector tốc độ đạn
			let vectorAB = { // vector pháp tuyến
				x: -vectorO1O2.y,
				y: vectorO1O2.x
			};
			let magAB = Math.sqrt(Math.pow(vectorAB.x, 2) + Math.pow(vectorAB.y, 2)); // length của vector pháp tuyến
			let scale = (bRadius / 2) / magAB; // scale để length của vector pháp tuyến = x length
			let A = {
					x: vectorAB.x * scale + px,
					y: vectorAB.y * scale + py
				},
				B = {
					x: -vectorAB.x * scale + px,
					y: -vectorAB.x * scale + py
				},
				C = {
					x: -vectorAB.x * scale + cx,
					y: -vectorAB.x * scale + cy
				},
				D = {
					x: vectorAB.x * scale + cx,
					y: vectorAB.y * scale + cy
				};
			let poly = [A, B, C, D];

			return collide.collideCirclePoly(circlePos.x, circlePos.y, radius, poly); //real * object.size - minus
		}
		case "Tree":
		case "Rock":
		case "Gunner":
			return collide.collideCircleCircle(circlePos.x, circlePos.y, radius, object.pos.x, object.pos.y, real * object.size - minus);
		case "Box_emty":
		case "Box_wooden":
		case "Roof_brown": {
			let newWidth = real.width * object.size - minus.width / 2;
			let newHeight = real.height * object.size - minus.height / 2;
			return collide.collideRectCircle(object.pos.x - newWidth / 2, object.pos.y - newHeight / 2, newWidth, newHeight, circlePos.x, circlePos.y, radius);
		}
		}
	},
	//
	// movePlayer: function () {
	// 	for (let i in move) {
	// 		if (move[i]) {
	// 			checkMoving = true;
	// 			switch (i) {
	// 			case "up":
	// 				if (position.y > -worldSize.height / 2 - 200)
	// 					position.y -= movingSpeed(gunner);
	// 				break;
	// 			case "down":
	// 				if (position.y < worldSize.height / 2 + 200)
	// 					position.y += movingSpeed(gunner);
	// 				break;
	// 			case "left":
	// 				if (position.x > -worldSize.width / 2 - 200)
	// 					position.x -= movingSpeed(gunner);
	// 				break;
	// 			case "right":
	// 				if (position.x < worldSize.width / 2 + 200)
	// 					position.x += movingSpeed(gunner);
	// 				break;
	// 			}
	// 		}
	// 	}
	// },

	shuffle: function (arr) { // thuật toán bogo-sort
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
	}
};
