import xssFilters from "xss-filters";
import uniqid from "uniqid";
import logger from "node-color-log";
import * as Modes from "../modes";
import {Room} from "../roommanager";

const modeList = (() => {
	const out = [];
	for (const modeName in Modes) {
		out.push(modeName);
	}
	return out;
})();

const RoomCreate = (server, socket, option) => {
	let {mode, text, maxPlayer} = option;
	// check form
	text = xssFilters.inHTMLData(text);
	maxPlayer = parseInt(maxPlayer);

	logger.info("A room created!");
	if (
		server.getRoomBySocketID(socket.id) ||
		modeList.indexOf(mode) == -1 ||
		maxPlayer < 5 ||
		maxPlayer > 15
	)
		return socket.emit("alert dialog", "Loi! Vui long thu lai sau . . .");

	const id = uniqid();
	const room = server.roomManager.add(
		new Room({
			_emitter: server._emitter.to(id),
			id, // id cua phong
			text, // dong thong diep
			master: socket.id, // chu phong
			maxPlayer, // so luong choi choi
			mode // game mode
		})
	);
	server._emitter.emit("RoomCreate", room.getData());
	server._emitter.emit("updaterooms", room.getData());
	
	// room.game.start();
};

export default RoomCreate;
