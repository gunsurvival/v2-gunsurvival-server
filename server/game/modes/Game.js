import random from "random";
import * as Matter from "matter-js";
import Sprites from "../sprites";
import * as QuadTreeUtil from "../helper/quadtree.js";
import {Guns} from "../items";
import {shuffle} from "../helper/helper.js";
import {items} from "../helper/helperConfig.js";

class Game {
	constructor({maxPlayer, frameTick = 30, _io} = {}) {
		this._io = _io;
		this.frameTick = frameTick;
		this.size = {
			width: 1500 + 400 * maxPlayer,
			height: 1000 + 300 * maxPlayer
		};

		this.allWeapons = "temp.json";
		this.interval; // interval varible
		//setting up world engine ....
		this.matterEngine = Matter.Engine.create();
		// gravity: {
		//       	x: 0,
		//       	y: 1,
		//       	scale: 0.001
		// },
		const objects = [];
		objects.push(
			Matter.Bodies.circle(0, 0, 0, {
				position: {
					x: 10,
					y: 20
				},
				circleRadius: 10
			})
		);
		// for (let i = 0; i < 10; i++){
		// 	objects.push(Matter.Bodies.rectangle(i*400, 200, 80, 80));
		// }
		// const boxB = Matter.Bodies.rectangle(450, 50, 80, 80);
		// const ground = Matter.Bodies.rectangle(400, 610, 810, 60, {
		// 	isStatic: true
		// });
		// objects.push(ground);
		Matter.World.add(this.matterEngine.world, objects);
		debugger;
	}

	getDeltaTime() {
		return 1000 / this.frameTick;
	}

	start() {
		let delay = 0;
		let stackDelay = 0;

		this.interval = setInterval(() => {
			let timeStart = Date.now();

			if (delay <= 0) {
				// not delaying the room
				Matter.Engine.update(this.matterEngine, this.getDeltaTime());

				// counting the proccesing speed
				this.speed = Date.now() - timeStart;
				// console.log(this.speed + "ms!");
				if (this.speed > 30) {
					// >30ms => room is not stable, lagging
					delay = this.speed / 30; // add delay to stabilize the room
					stackDelay += delay;
					if (stackDelay > 100) {
						// Phòng này lầy quá nên destroy :(
						this._io.emit("dialog alert", "Phòng quá tải!");
						this.destroy();
					}
				} else {
					stackDelay -= stackDelay > 0 ? 0.5 : 0;
				}
			} else {
				// Nếu room này đang lag thì phải vào hàng chờ, (nghi vấn phá server, spam)
				delay -= delay > 0 ? 1 : 0;
			}
		}, this.getDeltaTime());
	}

	sendUpdates() {
		// const updates = [];
		// for (const body of this.matterEngine.world.bodies) {
		// 	updates.push(body);
		// }

		this._io.emit("Update", this.matterEngine.world.bodies);
	}

	createMap(mode, templateMap) {
		// switch (mode) {
		// 	case "random":
		// 		for (let i = 0; i <= (70 / 2500) * this.size.width; i++) {
		// 			this.staticObjects.map.push(new Sprites.Sprite({
		// 				pos: {
		// 					x: random.float(-this.size.width / 2, this.size.width / 2).toFixed(1) - 0,
		// 					y: random.float(-this.size.height / 2, this.size.height / 2).toFixed(1) - 0
		// 				},
		// 				size: random.float(0.5, 1.5).toFixed(3) - 0, //add more size
		// 				defaultRange: 180,
		// 				degree: 0,
		// 				type: ["Rock", "Tree"][random.int(0, 1)],
		// 				id: i
		// 			}));
		// 			let newRange = this.staticObjects.map[this.staticObjects.map.length - 1].getQueryRange();
		// 			if (this.biggestStaticDiameterRange < newRange)
		// 				this.biggestStaticDiameterRange = newRange;
		// 		}
		// 		break;
		// 	case "template":
		// 		for (let object of templateMap) {
		// 			this.staticObjects.map.push(new Sprites.Sprite({
		// 				pos: object.pos,
		// 				size: object.size, //add more size
		// 				defaultRange: 180,
		// 				degree: object.degree,
		// 				type: object.name,
		// 				id: object.id
		// 			}));
		// 			let newRange = this.staticObjects.map[this.staticObjects.map.length - 1].getQueryRange();
		// 			if (this.biggestStaticDiameterRange < newRange)
		// 				this.biggestStaticDiameterRange = newRange;
		// 		}
		// 		break;
		// }
	}

	addSprite(spriteName, spriteConfig) {
		const sprite = new Sprites[spriteName](spriteConfig);
		Matter.World.add(this.matterEngine.world, sprite.matterBody);
	}

	addPlayer(socket) {
		// them player vao room
		return;
		shuffle(this.allWeapons);
		let guns = [];
		for (let i = 0; i < 2; i++) {
			if (i > this.allWeapons.length - 1) break;
			let gunConfig = this.allWeapons[i];
			gunConfig.ownerID = socket.id;
			guns.push(new Guns[items[gunConfig.name].class](gunConfig));
		}

		const gunner = new Sprites.CounterTerrorist({
			id: socket.id,
			pos: {
				x: random.int(-this.size.width / 2, this.size.width / 2),
				y: random.int(-this.size.height / 2, this.size.height / 2)
			},
			bag: {
				arr: guns,
				index: 0
			},
			defaultRange: 80
		});
		// this.addObject("gunners", gunner);
		return gunner;
	}

	destroy() {
		// xoa room
		clearInterval(this.interval);
	}
}

export default Game;
