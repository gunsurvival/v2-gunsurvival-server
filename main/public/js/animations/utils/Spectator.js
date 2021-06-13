import Middleware from "./Middleware.js";

export default class Spectator extends Middleware {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "Spectator"
			},
			config
		);
		super(config);
		this.isSpectator = false;
		this.index = 0;
		this.queue = [];
		this.text = "";
		this.killedBy = "";
	}

	showText(s) {
		s.push();
		s.textAlign(s.CENTER, s.CENTER);
		s.text(this.text, s.width / 2, s.height / 4);
		s.pop();
	}

	stop() {
		this.isSpectator = false;
		this.queue.length = 0;
		this.text = "";
		this.killedBy = "";
		this.index = 0;
	}

	start(killedBy) {
		this.killedBy = killedBy;
		this.text = "LOL noob, you was killed by this pro gamer ¯_(ツ)_/¯";
		this.isSpectator = true;
		this.createQueue();
		this.index = this.queue.findIndex(e => e.id == killedBy);
		if (this.index == -1) this.index = 0;
		return this.queue[this.index].pos;
	}

	next() {
		this.index++;
		if (this.index > this.queue.length - 1) {
			this.createQueue();
			this.index = 0;
		}
		this.updateText();
		return this.queue[this.index].pos; // return next element queue
	}

	previous() {
		this.index--;
		if (this.index < 0) {
			this.createQueue();
			this.index = this.queue.length - 1;
		}
		this.updateText();
		return this.queue[this.index].pos; // return previous element queue
	}

	updateText() {
		if (this.killedBy == this.queue[this.index].id)
			this.text = "LOL noob, you was killed by this pro gamer ¯_(ツ)_/¯";
		else {
			this.text = "You are watching < " + this.queue[this.index].name + " >";
		}
	}

	// createQueue() {
	// 	this.queue.length = 0;
	// 	for (let gunner of gunners) {
	// 		if (gunner.id != socket.id)
	// 			this.queue.push({
	// 				id: gunner.id,
	// 				name: gunner.name,
	// 				pos: gunner.pos
	// 			});
	// 	}
	// 	// shuffle(this.queue);
	// 	return this.queue[0].pos; // return first element when created new queue
	// }

	delete(id) {
		let i = this.queue.findIndex(e => e.id == id);
		if (i != -1) {
			// found index of pos
			this.queue.splice(i, 1);
			if (i < this.index) this.index--;
			if (this.index > this.queue.length - 1)
				this.index = this.queue.length - 1;
		}
		if (this.queue.length == 0) {
			let indexG = gunners.findIndex(e => e.id == socket.id);
			if (indexG == -1) return;
			let gunner = gunners[indexG];
			this.queue.push({
				id: socket.id,
				name: gunner.name,
				pos: gunner.pos
			});
			this.index = 0;
			this.text = "This is you, there is no one else in this room :)";
		} else this.updateText();
		return this.queue[this.index].pos;
	}
}

export default Spectator;
