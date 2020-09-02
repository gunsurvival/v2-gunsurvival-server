import random from "random";
import axios from "axios";
import Human from "./Human.js";

class Mitsuku extends Human {
	constructor(config) {
		super(config);
		this.img = "mitsuku";
		this.isBot = true;
		this.delayChangeDirection = 0;
	}

	reply(text, room) {
		let fakeSocket = {
			id: this.id,
			isBot: true
		};
		axios({
			url: "https://kakko.pandorabots.com/pandora/talk-xml",
			data: `input=${text}&botid=9fa364f2fe345a10&custid=9a7bc0f95e4abb96`,
			method: "POST",
			mode: "no-cors"
		}).then(res => {
			let regexString = /<that>(.*?)<\/that>/.exec(res.data);
			let responseChat = regexString ? regexString[1] : "...";
			responseChat = responseChat.replace(/&quot;/g, "| ");
			room.addChat(responseChat, fakeSocket, false);
		});
	}

	update(room) {
		// super.update(room);
		if (this.delayChangeDirection > 0) {
			this.delayChangeDirection--;
		} else {
			let newDegree = random.int(0, 360);
			let newSpeed = {
				x: Math.cos((newDegree * Math.PI) / 180),
				y: Math.sin((newDegree * Math.PI) / 180)
			};
			let scale =
				this.getMovingSpeed() /
				Math.sqrt(Math.pow(newSpeed.x, 2) + Math.pow(newSpeed.y, 2));

			this.degree = newDegree;
			this.speed = {
				x: newDegree.x * scale,
				y: newDegree.y * scale
			};

			this.delayChangeDirection = 10;
		}

		super.update(room); // update normal person stuff

		let movingSpeed = this.getMovingSpeed();
		let movingVector = {
			x: Math.cos((this.degree * Math.PI) / 180),
			y: Math.sin((this.degree * Math.PI) / 180)
		};
		let magMovingVector = Math.sqrt(
			Math.pow(movingVector.x, 2) + Math.pow(movingVector.y, 2)
		);
		let scale = movingSpeed / magMovingVector;
		movingVector.x *= scale;
		movingVector.y *= scale;
		this.pos.x += movingVector.x;
		this.pos.y += movingVector.y;
		// end of update bot position

		let item = this.bag.arr[this.bag.index];
		item.update(room);
		// if ()
	}
}

export default Mitsuku;
