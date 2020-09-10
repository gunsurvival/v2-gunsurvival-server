import random from "random";
import * as Sprite from "../sprite";
import Game from "./Game.js";

class King extends Game {
	constructor(config) {
		super(config);
		this.mode = "King";
		this.createMap(
			"template",
			JSON.parse(
				'[{"pos":{"x":-240,"y":-80},"size":0.57,"degree":0,"name":"Box_wooden","id":0},{"pos":{"x":-240,"y":0},"size":0.57,"degree":0,"name":"Box_wooden","id":1},{"pos":{"x":-240,"y":80},"size":0.57,"degree":0,"name":"Box_wooden","id":2},{"pos":{"x":-240,"y":160},"size":0.57,"degree":0,"name":"Box_wooden","id":3},{"pos":{"x":-240,"y":240},"size":0.57,"degree":0,"name":"Box_wooden","id":4},{"pos":{"x":-160,"y":240},"size":0.57,"degree":0,"name":"Box_wooden","id":5},{"pos":{"x":-80,"y":240},"size":0.57,"degree":0,"name":"Box_wooden","id":6},{"pos":{"x":0,"y":240},"size":0.57,"degree":0,"name":"Box_wooden","id":7},{"pos":{"x":80,"y":240},"size":0.57,"degree":0,"name":"Box_wooden","id":8},{"pos":{"x":160,"y":240},"size":0.57,"degree":0,"name":"Box_wooden","id":9},{"pos":{"x":240,"y":240},"size":0.57,"degree":0,"name":"Box_wooden","id":10},{"pos":{"x":240,"y":160},"size":0.57,"degree":0,"name":"Box_wooden","id":11},{"pos":{"x":240,"y":80},"size":0.57,"degree":0,"name":"Box_wooden","id":12},{"pos":{"x":240,"y":0},"size":0.57,"degree":0,"name":"Box_wooden","id":13},{"pos":{"x":240,"y":-80},"size":0.57,"degree":0,"name":"Box_wooden","id":14},{"pos":{"x":240,"y":-160},"size":0.57,"degree":0,"name":"Box_wooden","id":15},{"pos":{"x":-240,"y":-160},"size":0.57,"degree":0,"name":"Box_wooden","id":16},{"pos":{"x":-240,"y":-240},"size":0.57,"degree":0,"name":"Box_wooden","id":17},{"pos":{"x":-160,"y":-240},"size":0.57,"degree":0,"name":"Box_wooden","id":18},{"pos":{"x":-80,"y":-240},"size":0.57,"degree":0,"name":"Box_wooden","id":19},{"pos":{"x":80,"y":-240},"size":0.57,"degree":0,"name":"Box_wooden","id":20},{"pos":{"x":160,"y":-240},"size":0.57,"degree":0,"name":"Box_wooden","id":21},{"pos":{"x":240,"y":-240},"size":0.57,"degree":0,"name":"Box_wooden","id":22},{"pos":{"x":-80,"y":-320},"size":0.57,"degree":0,"name":"Tree","id":23},{"pos":{"x":80,"y":-320},"size":0.57,"degree":0,"name":"Tree","id":24},{"pos":{"x":-405,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":25},{"pos":{"x":-405,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":26},{"pos":{"x":-405,"y":-630},"size":0.25,"degree":0,"name":"Rock","id":27},{"pos":{"x":-405,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":28},{"pos":{"x":-360,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":29},{"pos":{"x":-360,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":30},{"pos":{"x":-270,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":31},{"pos":{"x":-270,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":32},{"pos":{"x":-270,"y":-630},"size":0.25,"degree":0,"name":"Rock","id":33},{"pos":{"x":-270,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":34},{"pos":{"x":-225,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":35},{"pos":{"x":-225,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":36},{"pos":{"x":-180,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":37},{"pos":{"x":-180,"y":-630},"size":0.25,"degree":0,"name":"Rock","id":38},{"pos":{"x":-90,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":39},{"pos":{"x":-90,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":40},{"pos":{"x":-90,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":41},{"pos":{"x":-90,"y":-630},"size":0.25,"degree":0,"name":"Rock","id":42},{"pos":{"x":-90,"y":-855},"size":0.25,"degree":0,"name":"Rock","id":43},{"pos":{"x":90,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":44},{"pos":{"x":45,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":45},{"pos":{"x":0,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":46},{"pos":{"x":45,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":47},{"pos":{"x":90,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":48},{"pos":{"x":45,"y":-630},"size":0.25,"degree":0,"name":"Rock","id":49},{"pos":{"x":0,"y":-585},"size":0.25,"degree":0,"name":"Rock","id":50},{"pos":{"x":180,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":51},{"pos":{"x":180,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":52},{"pos":{"x":225,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":53},{"pos":{"x":270,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":54},{"pos":{"x":225,"y":-630},"size":0.25,"degree":0,"name":"Rock","id":55},{"pos":{"x":270,"y":-630},"size":0.25,"degree":0,"name":"Rock","id":56},{"pos":{"x":315,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":57},{"pos":{"x":315,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":58},{"pos":{"x":405,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":59},{"pos":{"x":405,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":60},{"pos":{"x":405,"y":-630},"size":0.25,"degree":0,"name":"Rock","id":61},{"pos":{"x":405,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":62},{"pos":{"x":450,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":63},{"pos":{"x":495,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":64},{"pos":{"x":540,"y":-630},"size":0.25,"degree":0,"name":"Rock","id":65},{"pos":{"x":540,"y":-675},"size":0.25,"degree":0,"name":"Rock","id":66},{"pos":{"x":540,"y":-720},"size":0.25,"degree":0,"name":"Rock","id":67},{"pos":{"x":540,"y":-765},"size":0.25,"degree":0,"name":"Rock","id":68},{"pos":{"x":-240,"y":-240},"size":0.49,"degree":0,"name":"Rock","id":69},{"pos":{"x":-180,"y":-240},"size":0.49,"degree":0,"name":"Rock","id":70},{"pos":{"x":-120,"y":-240},"size":0.49,"degree":0,"name":"Rock","id":71},{"pos":{"x":-60,"y":-240},"size":0.49,"degree":0,"name":"Rock","id":72},{"pos":{"x":-240,"y":-180},"size":0.49,"degree":0,"name":"Rock","id":73},{"pos":{"x":-240,"y":-120},"size":0.49,"degree":0,"name":"Rock","id":74},{"pos":{"x":-240,"y":-60},"size":0.49,"degree":0,"name":"Rock","id":75},{"pos":{"x":-240,"y":0},"size":0.49,"degree":0,"name":"Rock","id":76},{"pos":{"x":-240,"y":60},"size":0.49,"degree":0,"name":"Rock","id":77},{"pos":{"x":-240,"y":120},"size":0.49,"degree":0,"name":"Rock","id":78},{"pos":{"x":-240,"y":180},"size":0.49,"degree":0,"name":"Rock","id":79},{"pos":{"x":-240,"y":240},"size":0.49,"degree":0,"name":"Rock","id":80},{"pos":{"x":-180,"y":240},"size":0.49,"degree":0,"name":"Rock","id":81},{"pos":{"x":-120,"y":240},"size":0.49,"degree":0,"name":"Rock","id":82},{"pos":{"x":-60,"y":240},"size":0.49,"degree":0,"name":"Rock","id":83},{"pos":{"x":0,"y":240},"size":0.49,"degree":0,"name":"Rock","id":84},{"pos":{"x":60,"y":240},"size":0.49,"degree":0,"name":"Rock","id":85},{"pos":{"x":120,"y":240},"size":0.49,"degree":0,"name":"Rock","id":86},{"pos":{"x":180,"y":240},"size":0.49,"degree":0,"name":"Rock","id":87},{"pos":{"x":240,"y":240},"size":0.49,"degree":0,"name":"Rock","id":88},{"pos":{"x":240,"y":180},"size":0.49,"degree":0,"name":"Rock","id":89},{"pos":{"x":240,"y":120},"size":0.49,"degree":0,"name":"Rock","id":90},{"pos":{"x":240,"y":60},"size":0.49,"degree":0,"name":"Rock","id":91},{"pos":{"x":240,"y":0},"size":0.49,"degree":0,"name":"Rock","id":92},{"pos":{"x":240,"y":-60},"size":0.49,"degree":0,"name":"Rock","id":93},{"pos":{"x":240,"y":-120},"size":0.49,"degree":0,"name":"Rock","id":94},{"pos":{"x":240,"y":-180},"size":0.49,"degree":0,"name":"Rock","id":95},{"pos":{"x":240,"y":-240},"size":0.49,"degree":0,"name":"Rock","id":96},{"pos":{"x":180,"y":-240},"size":0.49,"degree":0,"name":"Rock","id":97},{"pos":{"x":120,"y":-240},"size":0.49,"degree":0,"name":"Rock","id":98},{"pos":{"x":60,"y":-240},"size":0.5,"degree":0,"name":"Rock","id":99}]'
			)
		);
		this.scoreInterval;
	}

	createScore() {
		this.addObject(
			"scores",
			new Sprites.Score({
				id: Date.now(),
				name: Date.now() + "score",
				pos: {
					x:
						random
							.float(-this.size.width / 2, this.size.width / 2)
							.toFixed(1) - 0,
					y:
						random
							.float(-this.size.width / 2, this.size.width / 2)
							.toFixed(1) - 0
				},
				defaultRange: 10,
				value: random.int(5, 40)
			})
		);
	}

	start() {
		super.start();
		this.createScore();
		this.scoreInterval = setInterval(() => {
			if (this.activeObjects.scores.length < 40) this.createScore();
		}, 1000);
	}

	destroy() {
		clearInterval(this.scoreInterval);
		super.destroy();
	}
}

export default King;
