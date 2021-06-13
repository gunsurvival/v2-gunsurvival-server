import Room from "./Room.js";

export default class Lobby extends Room {
	constructor(options = {}) {
		const {socket} = options;
		super({
			id: "lobby" + socket.id,
			master: socket.id,
			description: "my lobby",
			...options
		});
	}

	keyPressed(sketch) {
		switch (sketch.key) {
			case "w":
				this.socket.emit("moving", {up: true});
				break;
			case "s":
				this.socket.emit("moving", {down: true});
				break;
			case "a":
				this.socket.emit("moving", {left: true});
				break;
			case "d":
				this.socket.emit("moving", {right: true});
				break;
		}
	}

	keyReleased(sketch) {
		switch (sketch.key) {
			case "w":
				this.socket.emit("moving", {up: false});
				break;
			case "s":
				this.socket.emit("moving", {down: false});
				break;
			case "a":
				this.socket.emit("moving", {left: false});
				break;
			case "d":
				this.socket.emit("moving", {right: false});
				break;
		}
	}

	async onJoin(socketID) {}

	async onLeave(socketID) {
		this.delete({id: socketID});
		debugger;
	}
}
