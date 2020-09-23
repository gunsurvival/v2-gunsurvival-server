import xssFilters from "xss-filters";
import uniqid from "uniqid";
import logger from "node-color-log";
import * as Mode from "../mode";
import { Room } from "../roommanager";

const modeList = (
	/**
	 * @return {Object} modeList - list names of mode
	 */
    () => {
        const out = [];
        for (const modeName in Mode) {
            out.push(modeName);
        }
        return out;
    }
)();

/**
 * Create a game room
 *
 * @memberof module:Event
 * @param  {GameServer} server - GameServer
 * @param  {Socket} socket - socket from event "connection" of io
 * @param  {Object} userData - Data emitted from the client-side
 * @param  {String} userData.mode - The name of game mode
 * @param  {String} userData.text - The room's description
 * @param  {Number} userData.maxPlayer - The max capicity of player in the room
 */
const RoomCreate = (server, socket, { mode, text, maxPlayer } = {}) => {
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