[
	{
		name: "ak47",
		bulletCount: 30,
		magazine: 10
	},
	{
		name: "m4a1",
		bulletCount: 30,
		magazine: 10
	},
	{
		name: "awp",
		bulletCount: 5,
		magazine: 10
	},
	{
		name: "paint",
		bulletCount: 10,
		magazine: 10
	},
	{
		name: "shotgun",
		bulletCount: 5,
		magazine: 10
	},
	{
		name: "chicken",
		bulletCount: 100,
		magazine: 0
	},
	{
		name: "gatlin",
		bulletCount: 200,
		magazine: 1
	},
	{
		name: "rpk",
		bulletCount: 80,
		magazine: 2
	},
	{
		name: "uzi",
		bulletCount: 25,
		magazine: 10
	},
	{
		name: "revolver",
		bulletCount: 8,
		magazine: 10
	},
	{
		name: "p90",
		bulletCount: 50,
		magazine: 5
	},
	{
		name: "rpg",
		bulletCount: 100,
		magazine: 0
	}
];

import random from "random";
import * as Matter from "matter-js";
import Sprites from "../sprites";
import * as QuadTreeUtil from "../helper/quadtree.js";
import {Guns} from "../items";
import {shuffle} from "../helper/helper.js";
import {items} from "../helper/helperConfig.js";

class Game {
	constructor({maxPlayer, _emitter} = {}) {
		this._emitter = _emitter;

		this.activeObjects = {};
		this.staticObjects = {};

		this.size = {
			width: 1500 + 400 * maxPlayer,
			height: 1000 + 300 * maxPlayer
		};

		this.interval;
		this.allWeapons = "temp.json";
		//setting up world engine ....
		const engine = Matter.Engine.create();
		const boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
		const boxB = Matter.Bodies.rectangle(450, 50, 80, 80);
		const ground = Matter.Bodies.rectangle(400, 610, 810, 60, {
			isStatic: true
		});
		Matter.World.add(engine.world, [boxA, boxB, ground]);
		Matter.Engine.run(engine);
		console.log(boxB);
		this.engine = engine;
	}

	sendUpdates() {
		let gameDatas = {};
		for (let groupName in this.activeObjects) {
			let group = this.activeObjects[groupName];
			let privateData, publicData;
			// private data nghia la nhung data khi trong truong hop dac biet se bi xoa di va emit rieng
			// public data emit cho toan bo nguoi choi trong room
			gameDatas[groupName] = [];
			for (let object of group) {
				switch (groupName) {
					case "gunners": {
						let {
							id,
							name,
							pos,
							bag,
							degree,
							blood,
							// status,
							size,
							img
						} = object;

						publicData = {
							id,
							name,
							pos,
							bag,
							degree,
							dead: blood <= 0,
							blood,
							size,
							img
						};

						// publicData = {
						// };

						// if (status.hideintree && blood > 0) { // neu dang tron va con song
						//     this._emitter.emit("update game", {
						//         groupName: "gunners",
						//         data: { gunners: [
						//             data: privateData
						//         ]}
						//     }); //update private là update chỉ riêng cho mình
						//     privateData = undefined; // xóa đi vì riêng tư, ko đc gửi cho nguoi khac
						// }
						break;
					}
					case "bullets": {
						let {
							id,
							pos,
							size,
							name,
							ownerID,
							speed,
							imgName
						} = object;

						publicData = {
							id,
							pos,
							size,
							name,
							ownerID,
							speed,
							imgName
						};
						break;
					}
					case "scores": {
						let {id, pos, value} = object;

						publicData = {
							id,
							pos,
							value
						};
						break;
					}
				}
				gameDatas[groupName].push(
					Object.assign(
						{
							id: object.id
						},
						privateData,
						publicData
					)
				);
			}
		}
		this._emitter.emit("update game", gameDatas);
	}

	addBot(id, name) {
		this.addObject(
			"gunners",
			new Sprites.Mitsuku({
				id,
				name,
				pos: {
					x: 0,
					y: 0
				},
				bag: {
					arr: [
						new Guns["Automatic"]({
							name: "gatlin",
							bulletCount: 50,
							magazine: 5
						})
					],
					index: 0
				},
				defaultRange: 80
			})
		);
	}

	start() {
		let delay = 0,
			stackDelay = 0;

		for (let i = 0; i < 2; i++) {
			this.addBot("mitsuku" + i, "Mitsuku Bot " + i);
		}

		this.interval = setInterval(() => {
			let timeStart = Date.now();

			if (delay <= 0) {
				// not delaying the room
				this.gameLoop();
				this.sendUpdates();

				// counting the proccesing speed
				this.speed = Date.now() - timeStart;
				if (this.speed / 30 > 1) {
					// room is not stable, lagging
					delay = this.speed / 30; // add delay to stabilize the room
					stackDelay += delay;
					if (stackDelay > 100) {
						// now the room is commit "not stable, need to do something"
						this._emitter.emit("dialog alert", "Phòng quá tải!");
						this.destroy();
					}
				} else {
					if (stackDelay > 0) stackDelay -= 0.5;
				}
			} else {
				// is delaying, room is not stable
				delay--;
			}
		}, 30);
	}

	gameLoop() {
		let biggestActiveDiameterRange = this._createActiveQtree(); // khac voi ham createStaticQtree(), ham nay co object.update()
		for (let groupName in this.activeObjects) {
			let group = this.activeObjects[groupName];
			for (let object of group) {
				let staticRange = new QuadTreeUtil.Circle(
					object.pos.x,
					object.pos.y,
					this.biggestStaticDiameterRange + object.getQueryRange() + 1
				);
				let staticPoints = this.staticQtree.query(staticRange);
				for (let point of staticPoints) {
					let {userData: pointData} = point;
					if (object.intersect(pointData.getBoundary())) {
						object.collide({
							copy: {},
							origin: pointData
						});
					}
				}

				let activeRange = new QuadTreeUtil.Circle(
					object.pos.x,
					object.pos.y,
					biggestActiveDiameterRange + object.getQueryRange() + 1
				);
				let activePoints = this.activeQtree.query(activeRange);
				for (let point of activePoints) {
					let {userData: pointData} = point;
					if (pointData.origin.id == object.id) continue;
					if (object.intersect(pointData.origin.getBoundary())) {
						object.collide(pointData);
					}
				}
			}
		}
	}

	createMap(mode, templateMap) {
		this.biggestStaticDiameterRange = 0;
		this.staticObjects.map = [];
		switch (mode) {
			case "random":
				for (let i = 0; i <= (70 / 2500) * this.size.width; i++) {
					this.staticObjects.map.push(
						new Sprites.Sprite({
							pos: {
								x:
									random
										.float(
											-this.size.width / 2,
											this.size.width / 2
										)
										.toFixed(1) - 0,
								y:
									random
										.float(
											-this.size.height / 2,
											this.size.height / 2
										)
										.toFixed(1) - 0
							},
							size: random.float(0.5, 1.5).toFixed(3) - 0, //add more size
							defaultRange: 180,
							degree: 0,
							type: ["Rock", "Tree"][random.int(0, 1)],
							id: i
						})
					);
					let newRange = this.staticObjects.map[
						this.staticObjects.map.length - 1
					].getQueryRange();
					if (this.biggestStaticDiameterRange < newRange)
						this.biggestStaticDiameterRange = newRange;
				}
				break;
			case "template":
				for (let object of templateMap) {
					this.staticObjects.map.push(
						new Sprites.Sprite({
							pos: object.pos,
							size: object.size, //add more size
							defaultRange: 180,
							degree: object.degree,
							type: object.name,
							id: object.id
						})
					);
					let newRange = this.staticObjects.map[
						this.staticObjects.map.length - 1
					].getQueryRange();
					if (this.biggestStaticDiameterRange < newRange)
						this.biggestStaticDiameterRange = newRange;
				}
				break;
		}
		this.createStaticQtree();
	}

	createStaticQtree() {
		let biggestDiameterRange = 0;
		this.staticQtree = new QuadTreeUtil.QuadTree(
			this.qtreeSetting.boundary,
			this.qtreeSetting.split
		);
		for (let groupName in this.staticObjects) {
			let group = this.staticObjects[groupName];
			for (let object of group) {
				this.staticQtree.insert(
					new QuadTreeUtil.Point(object.pos.x, object.pos.y, object)
				);
				if (biggestDiameterRange < object.getQueryRange())
					biggestDiameterRange = object.getQueryRange();
			}
		}
		return biggestDiameterRange; // range collide cao nhat (de query khong bi thieu)
	}

	_createActiveQtree() {
		this.activeQtree = new QuadTreeUtil.QuadTree(
			this.qtreeSetting.boundary,
			this.qtreeSetting.split
		);
		// them object.update vi chay 2 lan vong lap ton thoi gian
		// insert vao sau 1 vat update se nhanh hon
		let biggestDiameterRange = 0;
		for (let groupName in this.activeObjects) {
			let group = this.activeObjects[groupName];
			for (let object of group) {
				if (object.delete) {
					this.deleteObject(groupName, object.id);
					continue;
				}
				object.update(this);
				this.activeQtree.insert(
					new QuadTreeUtil.Point(object.pos.x, object.pos.y, {
						copy: JSON.parse(JSON.stringify(object)),
						origin: object
					})
				);

				if (biggestDiameterRange < object.getQueryRange())
					biggestDiameterRange = object.getQueryRange();
			}
		}
		return biggestDiameterRange; // range collide cao nhat (de query khong bi thieu)
	}

	addPlayer(socket) {
		// them player vao room
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
		this.addObject("gunners", gunner);
		return gunner;
	}

	addObject(group, data) {
		if (!this.activeObjects[group]) this.activeObjects[group] = [];
		this.activeObjects[group].push(data);
	}

	deleteObject(group, id) {
		if (this.activeObjects[group]) {
			let index = this.activeObjects[group].findIndex(e => e.id == id);
			this.activeObjects[group].splice(index, 1);
			return true;
		}

		return false;
	}

	findObject(group, id) {
		if (this.activeObjects[group]) {
			let index = this.activeObjects[group].findIndex(e => e.id == id);
			if (index == -1) return false;
			else return this.activeObjects[group][index];
		}

		if (this.staticObjects[group]) {
			let index = this.staticObjects[group].findIndex(e => e.id == id);
			if (index == -1) return false;
			else return this.staticObjects[group][index];
		}

		return false;
	}

	destroy() {
		// xoa room
		clearInterval(this.interval);
	}
}

export default Game;
