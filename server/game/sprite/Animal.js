import random from "random";
import axios from "axios";
import Sprite from "./Sprite.js";

class Animal extends Sprite {
	constructor(config={}) {
		super(config);
		this.delayChangeDirection = 0;
	}

	reply(text, room) {
		axios({
			url: "https://kakko.pandorabots.com/pandora/talk-xml",
			data: `input=${text}&botid=9fa364f2fe345a10&custid=9a7bc0f95e4abb96`,
			method: "POST",
			mode: "no-cors"
		}).then(res => {
			const regexString = /<that>(.*?)<\/that>/.exec(res.data);
			const responseChat = regexString ? regexString[1] : "...";
			responseChat = responseChat.replace(/([^\s]+)/, "oink");
			room.addChat(responseChat, this.id);
		});
	}

	update(queueAddSprites) {
		super.update(queueAddSprites);
		
		if (this.delayChangeDirection > 0) {
			this.delayChangeDirection--;
		} else {
			const newDegree = random.int(0, 360);
			const newSpeed = {
				x: Math.cos((newDegree * Math.PI) / 180),
				y: Math.sin((newDegree * Math.PI) / 180)
			};
			const scale =
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

		const movingSpeed = this.getMovingSpeed();
		const movingVector = {
			x: Math.cos((this.degree * Math.PI) / 180),
			y: Math.sin((this.degree * Math.PI) / 180)
		};
		const magMovingVector = Math.sqrt(
			Math.pow(movingVector.x, 2) + Math.pow(movingVector.y, 2)
		);
		const scale = movingSpeed / magMovingVector;
		movingVector.x *= scale;
		movingVector.y *= scale;
		this.pos.x += movingVector.x;
		this.pos.y += movingVector.y;
		// end of update bot position

		const item = this.bag.arr[this.bag.index];
		item.update(room);
		// if ()
	}
}

export default Animal;
