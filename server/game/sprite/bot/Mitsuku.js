import * as Matter from "matter-js";
import axios from "axios";
import Bot from "./Bot.js";

class Mitsuku extends Bot {
	constructor(config) {
		config = Matter.Common.extend({
		    botName: "Mitsuku"
		}, config);
		super(config);
	}

	reply(text, room) {
		const fakeSocket = {
			id: this.id,
			isBot: true
		};
		axios({
			url: "https://kakko.pandorabots.com/pandora/talk-xml",
			data: `input=${text}&botid=9fa364f2fe345a10&custid=9a7bc0f95e4abb96`,
			method: "POST",
			mode: "no-cors"
		}).then(res => {
			const regexString = /<that>(.*?)<\/that>/.exec(res.data);
			const responseChat = regexString ? regexString[1] : "...";
			responseChat = responseChat.replace(/&quot;/g, "| ");
			room.addChat(responseChat, fakeSocket, false);
		});
	}
}

export default Mitsuku;
