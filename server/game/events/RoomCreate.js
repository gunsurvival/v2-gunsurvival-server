import xssFilters from "xss-filters";
import uniqid from "uniqid";
import * as Modes from "../modes";
import {Room} from "../roommanager";

const modeList = (() => {
	const out = [];
	for (let modeName in Modes) {
		out.push(modeName);
	}
	return out;
})();

const RoomCreate = (server, socket, {text, maxPlayer, mode} = {}) => {
	if (
		server.getRoomBySocketID(socket.id) ||
		modeList.indexOf(mode) == -1 ||
		maxPlayer < 5 ||
		maxPlayer > 15 ||
		isNaN(maxPlayer)
	)
		return socket.emit("dialog alert", "Loi! Vui long thu lai sau . . .");

	text = xssFilters.inHTMLData(text);

	const room = server.roomManager.add(
		new Room({
			id: uniqid(), // id cua phong
			text, // dong thong diep
			master: socket.id, // chu phong
			maxPlayer, // so luong choi choi
			mode // game mode
		})
	);
	room.game.start();

	server._emitter.emit("RoomCreate", room.getData());
	socket.emit("room created", room.id);
};

export default RoomCreate;
