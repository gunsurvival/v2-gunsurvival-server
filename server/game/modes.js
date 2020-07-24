import { Config, Sprites, Weapons, QuadTreeUtil, Shuffle } from "./utils.js";
import random from "random";
const { ITEM_CONFIG } = Config;

class Mode {
	constructor({
		maxPlayer,
		_emitter
	} = {}) {
		this._emitter = _emitter;

		this.activeObjects = {};
		this.staticObjects = {};

		this.size = {
			width: 1500 + 400 * maxPlayer,
			height: 1000 + 300 * maxPlayer
		};

		this.interval;

		this.allWeapons = [{
			"name": "ak47",
			"bulletCount": 30,
			"magazine": 10
		},
		{
			"name": "m4a1",
			"bulletCount": 30,
			"magazine": 10
		},
		{
			"name": "awp",
			"bulletCount": 5,
			"magazine": 10
		},
		{
			"name": "paint",
			"bulletCount": 10,
			"magazine": 10
		},
		{
			"name": "shotgun",
			"bulletCount": 5,
			"magazine": 10
		},
		{
			"name": "chicken",
			"bulletCount": 100,
			"magazine": 0
		},
		{
			"name": "gatlin",
			"bulletCount": 200,
			"magazine": 1
		},
		{
			"name": "rpk",
			"bulletCount": 80,
			"magazine": 2
		},
		{
			"name": "uzi",
			"bulletCount": 25,
			"magazine": 10
		},
		{
			"name": "revolver",
			"bulletCount": 8,
			"magazine": 10
		},
		{
			"name": "p90",
			"bulletCount": 50,
			"magazine": 5
		},
		{
			"name": "rpg",
			"bulletCount": 100,
			"magazine": 0
		}
		];

		this.activeQtree;
		this.staticQtree;
		this.qtreeSetting = {
			boundary: new QuadTreeUtil.Rectangle(0, 0, this.size.width, this.size.height),
			split: 4
		};
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
				case "gunners":
				{
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
				case "bullets":
				{
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
				case "scores":
				{
					let {
						id,
						pos,
						value
					} = object;

					publicData = {
						id,
						pos,
						value
					};
					break;
				}
				}
				gameDatas[groupName].push(Object.assign({ id: object.id }, privateData, publicData));
			}
		}
		this._emitter.emit("update game", gameDatas);
	}

	addBot(id, name) {
		this.addObject("gunners", new Sprites.Mitsuku({
			id,
			name,
			pos: {
				x: 0,
				y: 0
			},
			bag: {
				arr: [new Weapons["Automatic"]({
					"name": "gatlin",
					"bulletCount": 50,
					"magazine": 5
				})],
				index: 0
			},
			defaultRange: 80
		}));
	}

	start() {
		let delay = 0,
			stackDelay = 0;

		for (let i = 0; i < 2; i++) {
			this.addBot("mitsuku" + i, "Mitsuku Bot " + i);
		}

		this.interval = setInterval(() => {
			let timeStart = Date.now();

			if (delay <= 0) { // not delaying the room
				this.gameLoop();
				this.sendUpdates();

				// counting the proccesing speed
				this.speed = Date.now() - timeStart;
				if (this.speed / 30 > 1) { // room is not stable, lagging
					delay = this.speed / 30; // add delay to stabilize the room
					stackDelay += delay;
					if (stackDelay > 100) { // now the room is commit "not stable, need to do something"
						this._emitter.emit("dialog alert", "Phòng quá tải!");
						this.destroy();
					}
				} else {
					if (stackDelay > 0)
						stackDelay -= 0.5;
				}
			} else { // is delaying, room is not stable
				delay--;
			}

		}, 30);
	}

	gameLoop() {
		let biggestActiveDiameterRange = this._createActiveQtree(); // khac voi ham createStaticQtree(), ham nay co object.update()
		for (let groupName in this.activeObjects) {
			let group = this.activeObjects[groupName];
			for (let object of group) {
				let staticRange = new QuadTreeUtil.Circle(object.pos.x, object.pos.y, this.biggestStaticDiameterRange + object.getQueryRange() + 1);
				let staticPoints = this.staticQtree.query(staticRange);
				for (let point of staticPoints) {
					let { userData: pointData } = point;
					if (object.intersect(pointData.getBoundary())) {
						object.collide({
							copy: {},
							origin: pointData
						});
					}
				}

				let activeRange = new QuadTreeUtil.Circle(object.pos.x, object.pos.y, biggestActiveDiameterRange + object.getQueryRange() + 1);
				let activePoints = this.activeQtree.query(activeRange);
				for (let point of activePoints) {
					let { userData: pointData } = point;
					if (pointData.origin.id == object.id)
						continue;
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
				this.staticObjects.map.push(new Sprites.Sprite({
					pos: {
						x: random.float(-this.size.width / 2, this.size.width / 2).toFixed(1) - 0,
						y: random.float(-this.size.height / 2, this.size.height / 2).toFixed(1) - 0
					},
					size: random.float(0.5, 1.5).toFixed(3) - 0, //add more size
					defaultRange: 180,
					degree: 0,
					type: ["Rock", "Tree"][random.int(0, 1)],
					id: i
				}));
				let newRange = this.staticObjects.map[this.staticObjects.map.length - 1].getQueryRange();
				if (this.biggestStaticDiameterRange < newRange)
					this.biggestStaticDiameterRange = newRange;
			}
			break;
		case "template":
			for (let object of templateMap) {
				this.staticObjects.map.push(new Sprites.Sprite({
					pos: object.pos,
					size: object.size, //add more size
					defaultRange: 180,
					degree: object.degree,
					type: object.name,
					id: object.id
				}));
				let newRange = this.staticObjects.map[this.staticObjects.map.length - 1].getQueryRange();
				if (this.biggestStaticDiameterRange < newRange)
					this.biggestStaticDiameterRange = newRange;
			}
			break;
		}
		this.createStaticQtree();
	}

	createStaticQtree() {
		let biggestDiameterRange = 0;
		this.staticQtree = new QuadTreeUtil.QuadTree(this.qtreeSetting.boundary, this.qtreeSetting.split);
		for (let groupName in this.staticObjects) {
			let group = this.staticObjects[groupName];
			for (let object of group) {
				this.staticQtree.insert(new QuadTreeUtil.Point(object.pos.x, object.pos.y, object));
				if (biggestDiameterRange < object.getQueryRange())
					biggestDiameterRange = object.getQueryRange();
			}
		}
		return biggestDiameterRange; // range collide cao nhat (de query khong bi thieu)
	}

	_createActiveQtree() {
		this.activeQtree = new QuadTreeUtil.QuadTree(this.qtreeSetting.boundary, this.qtreeSetting.split);
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
				this.activeQtree.insert(new QuadTreeUtil.Point(object.pos.x, object.pos.y, {
					copy: JSON.parse(JSON.stringify(object)),
					origin: object
				}));

				if (biggestDiameterRange < object.getQueryRange())
					biggestDiameterRange = object.getQueryRange();
			}
		}
		return biggestDiameterRange; // range collide cao nhat (de query khong bi thieu)
	}

	addPlayer(socket) { // them player vao room
		Shuffle(this.allWeapons);
		let guns = [];
		for (let i = 0; i < 2; i++) {
			if (i > this.allWeapons.length - 1)
				break;
			let gunConfig = this.allWeapons[i];
			gunConfig.ownerID = socket.id;
			guns.push(new Weapons[ITEM_CONFIG[gunConfig.name].class](gunConfig));
		};

		const gunner = new Sprites.CounterTerrorist({
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
		if (!this.activeObjects[group])
			this.activeObjects[group] = [];
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
			if (index == -1)
				return false;
			else
				return this.activeObjects[group][index];
		}

		if (this.staticObjects[group]) {
			let index = this.staticObjects[group].findIndex(e => e.id == id);
			if (index == -1)
				return false;
			else
				return this.staticObjects[group][index];
		}

		return false;
	}

	destroy() { // xoa room
		clearInterval(this.interval);
	}
}

class Creative extends Mode {
	constructor(config) {
		super(config);
		this.mode = "creative";
		this.createMap("random");
	}
}

class King extends Mode {
	constructor(config) {
		super(config);
		this.mode = "king";
		this.createMap("template", JSON.parse("[{\"pos\":{\"x\":-240,\"y\":-80},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":0},{\"pos\":{\"x\":-240,\"y\":0},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":1},{\"pos\":{\"x\":-240,\"y\":80},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":2},{\"pos\":{\"x\":-240,\"y\":160},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":3},{\"pos\":{\"x\":-240,\"y\":240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":4},{\"pos\":{\"x\":-160,\"y\":240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":5},{\"pos\":{\"x\":-80,\"y\":240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":6},{\"pos\":{\"x\":0,\"y\":240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":7},{\"pos\":{\"x\":80,\"y\":240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":8},{\"pos\":{\"x\":160,\"y\":240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":9},{\"pos\":{\"x\":240,\"y\":240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":10},{\"pos\":{\"x\":240,\"y\":160},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":11},{\"pos\":{\"x\":240,\"y\":80},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":12},{\"pos\":{\"x\":240,\"y\":0},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":13},{\"pos\":{\"x\":240,\"y\":-80},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":14},{\"pos\":{\"x\":240,\"y\":-160},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":15},{\"pos\":{\"x\":-240,\"y\":-160},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":16},{\"pos\":{\"x\":-240,\"y\":-240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":17},{\"pos\":{\"x\":-160,\"y\":-240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":18},{\"pos\":{\"x\":-80,\"y\":-240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":19},{\"pos\":{\"x\":80,\"y\":-240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":20},{\"pos\":{\"x\":160,\"y\":-240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":21},{\"pos\":{\"x\":240,\"y\":-240},\"size\":0.57,\"degree\":0,\"name\":\"Box_wooden\",\"id\":22},{\"pos\":{\"x\":-80,\"y\":-320},\"size\":0.57,\"degree\":0,\"name\":\"Tree\",\"id\":23},{\"pos\":{\"x\":80,\"y\":-320},\"size\":0.57,\"degree\":0,\"name\":\"Tree\",\"id\":24},{\"pos\":{\"x\":-405,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":25},{\"pos\":{\"x\":-405,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":26},{\"pos\":{\"x\":-405,\"y\":-630},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":27},{\"pos\":{\"x\":-405,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":28},{\"pos\":{\"x\":-360,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":29},{\"pos\":{\"x\":-360,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":30},{\"pos\":{\"x\":-270,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":31},{\"pos\":{\"x\":-270,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":32},{\"pos\":{\"x\":-270,\"y\":-630},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":33},{\"pos\":{\"x\":-270,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":34},{\"pos\":{\"x\":-225,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":35},{\"pos\":{\"x\":-225,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":36},{\"pos\":{\"x\":-180,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":37},{\"pos\":{\"x\":-180,\"y\":-630},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":38},{\"pos\":{\"x\":-90,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":39},{\"pos\":{\"x\":-90,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":40},{\"pos\":{\"x\":-90,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":41},{\"pos\":{\"x\":-90,\"y\":-630},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":42},{\"pos\":{\"x\":-90,\"y\":-855},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":43},{\"pos\":{\"x\":90,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":44},{\"pos\":{\"x\":45,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":45},{\"pos\":{\"x\":0,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":46},{\"pos\":{\"x\":45,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":47},{\"pos\":{\"x\":90,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":48},{\"pos\":{\"x\":45,\"y\":-630},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":49},{\"pos\":{\"x\":0,\"y\":-585},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":50},{\"pos\":{\"x\":180,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":51},{\"pos\":{\"x\":180,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":52},{\"pos\":{\"x\":225,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":53},{\"pos\":{\"x\":270,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":54},{\"pos\":{\"x\":225,\"y\":-630},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":55},{\"pos\":{\"x\":270,\"y\":-630},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":56},{\"pos\":{\"x\":315,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":57},{\"pos\":{\"x\":315,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":58},{\"pos\":{\"x\":405,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":59},{\"pos\":{\"x\":405,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":60},{\"pos\":{\"x\":405,\"y\":-630},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":61},{\"pos\":{\"x\":405,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":62},{\"pos\":{\"x\":450,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":63},{\"pos\":{\"x\":495,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":64},{\"pos\":{\"x\":540,\"y\":-630},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":65},{\"pos\":{\"x\":540,\"y\":-675},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":66},{\"pos\":{\"x\":540,\"y\":-720},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":67},{\"pos\":{\"x\":540,\"y\":-765},\"size\":0.25,\"degree\":0,\"name\":\"Rock\",\"id\":68},{\"pos\":{\"x\":-240,\"y\":-240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":69},{\"pos\":{\"x\":-180,\"y\":-240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":70},{\"pos\":{\"x\":-120,\"y\":-240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":71},{\"pos\":{\"x\":-60,\"y\":-240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":72},{\"pos\":{\"x\":-240,\"y\":-180},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":73},{\"pos\":{\"x\":-240,\"y\":-120},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":74},{\"pos\":{\"x\":-240,\"y\":-60},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":75},{\"pos\":{\"x\":-240,\"y\":0},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":76},{\"pos\":{\"x\":-240,\"y\":60},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":77},{\"pos\":{\"x\":-240,\"y\":120},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":78},{\"pos\":{\"x\":-240,\"y\":180},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":79},{\"pos\":{\"x\":-240,\"y\":240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":80},{\"pos\":{\"x\":-180,\"y\":240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":81},{\"pos\":{\"x\":-120,\"y\":240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":82},{\"pos\":{\"x\":-60,\"y\":240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":83},{\"pos\":{\"x\":0,\"y\":240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":84},{\"pos\":{\"x\":60,\"y\":240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":85},{\"pos\":{\"x\":120,\"y\":240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":86},{\"pos\":{\"x\":180,\"y\":240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":87},{\"pos\":{\"x\":240,\"y\":240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":88},{\"pos\":{\"x\":240,\"y\":180},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":89},{\"pos\":{\"x\":240,\"y\":120},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":90},{\"pos\":{\"x\":240,\"y\":60},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":91},{\"pos\":{\"x\":240,\"y\":0},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":92},{\"pos\":{\"x\":240,\"y\":-60},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":93},{\"pos\":{\"x\":240,\"y\":-120},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":94},{\"pos\":{\"x\":240,\"y\":-180},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":95},{\"pos\":{\"x\":240,\"y\":-240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":96},{\"pos\":{\"x\":180,\"y\":-240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":97},{\"pos\":{\"x\":120,\"y\":-240},\"size\":0.49,\"degree\":0,\"name\":\"Rock\",\"id\":98},{\"pos\":{\"x\":60,\"y\":-240},\"size\":0.5,\"degree\":0,\"name\":\"Rock\",\"id\":99}]"));
		this.scoreInterval;
	}

	createScore() {
		this.addObject("scores", new Sprites.Score({
			id: Date.now(),
			name: Date.now() + "score",
			pos: {
				x: random.float(-this.size.width / 2, this.size.width / 2).toFixed(1) - 0,
				y: random.float(-this.size.width / 2, this.size.width / 2).toFixed(1) - 0
			},
			defaultRange: 10,
			value: random.int(5, 40)
		}));
	}

	start() {
		super.start();
		this.createScore();
		this.scoreInterval = setInterval(() => {
			if (this.activeObjects.scores.length < 40)
				this.createScore();
		}, 1000);
	}

	destroy() {
		clearInterval(this.scoreInterval);
		super.destroy();
	}
}

export {
	Mode,
	Creative,
	King
};
