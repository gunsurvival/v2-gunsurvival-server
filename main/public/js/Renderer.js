import Manager from "./helpers/Manager.js";
import {loadAssets} from "./globals/asset.global.js";

const p5_functions = [
	"keyPressed",
	"keyReleased",
	"mousePressed",
	"mouseReleased"
];

export default class Renderer extends Manager {
	constructor() {
		super();
		this.currentIndex = -1;
		this.interval;
		this.tps = 30;
		this.tick = 0;
	}

	switchTo(index) {
		if (this.items[index]) {
			this.currentIndex = index;
			this.items[index]._executedSetup = false;
		}
	}

	inject(sketch) {
		sketch.preload = () => {
			// Sweetalert2.fire({
			// 	title: "bruh",
			// 	text: "loading"
			// });
			loadAssets({
				sketch,
				onProgress: () => {}
			});
		};

		sketch.setup = () => {
			sketch.createCanvas(window.innerWidth, window.innerHeight);
			sketch.imageMode(sketch.CENTER);
		};

		sketch.draw = () => {
			sketch.push();

			const cur = this.items[this.currentIndex];
			if (!cur._executedSetup) {
				cur.setup && cur.setup(sketch);
				cur._executedSetup = true;
			}

			cur.update && cur.update(sketch);

			sketch.pop();
			this.tick++;
		};

		this.interval = setInterval(() => {
			const div = Math.abs(this.tick - this.tps);
			if (this.tick - this.tps > this.tps / 10) this.tps += Math.round(div / 2);
			if (this.tps - this.tick > this.tps / 10) this.tps -= Math.round(div / 2);
			this.tick = 0;
			// console.log(this.tps);
		}, 1000);

		for (const func_name of p5_functions) {
			sketch[func_name] = () => {
				this.items[this.currentIndex][func_name] &&
					this.items[this.currentIndex][func_name](sketch);
			};
		}
	}
}
