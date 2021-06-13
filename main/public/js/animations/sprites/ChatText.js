import Sprite from "./Sprite.js";

class ChatText extends Sprite {
	constructor(config = {}) {
		config = Object.assign(
			{
				name: "ChatText",
				liveTime: 100 + config.text.length * 5
			},
			config
		);
		super(config);
		const {text = "Mmmmmmk ._>", margin = 20} = config;
		this.text = text;
		this.relativePos = {
			y: -100 // vị trí ban đầu của chat
		};
		this.margin = margin;
	}

	update(s) {
		super.update(s);
		if (this.relativePos.y > -150)
			this.relativePos.y -= this.frameCount / 80;
	}

	draw(s) {
		super.draw(s);
		s.push();
		s.noStroke();
		s.fill("black");
		s.textSize(23);
		const textSize = {
			width: s.textWidth(this.text),
			height: s.textAscent() * 0.79
		};
		s.rect(
			this.pos.x,
			this.pos.y + this.relativePos.y,
			textSize.width + this.margin,
			textSize.height + this.margin,
			20
		);
		s.textAlign(s.CENTER, s.CENTER);
		s.fill("white");
		s.text(this.text, this.pos.x, this.pos.y + this.relativePos.y);
		s.pop();
	}
}

export default ChatText;
