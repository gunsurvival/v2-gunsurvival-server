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

const RoomCreate = (server, socket, {mode, text, maxPlayer} = {}) => {
	// check form
	mode = String(mode);
	text = xssFilters.inHTMLData(String(text));
	maxPlayer = parseInt(maxPlayer);

	logger.info(`A room created by ${socket.id}!`);
	if (
		server.getRoomBySocketID(socket.id) ||
		modeList.indexOf(mode) == -1 ||
		isNaN(maxPlayer) ||
		maxPlayer < 5 ||
		maxPlayer > 15
	)
		return socket.emit("alert dialog", "Vui long thu lai sau . . .");
	const id = uniqid();
	const room = server.roomManager.add(
		new Room({
			_io: server._io,
			id, // id cua phong
			master: socket.id, // chu phong
			text, // dong thong diep
			maxPlayer, // so luong choi choi
			mode, // game mode
			gameOption: {
				frameTick: 30
			}
		})
	);
	socket.emit("RoomCreate", room.getData());
	server._io.emit("updaterooms", room.getData());
	
	room.game.start(); // start game logic
};

export default RoomCreate;
