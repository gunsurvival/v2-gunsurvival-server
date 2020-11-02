import logger from "node-color-log";
import Manager from "./helper/Manager.js";
import * as Event from "./Event";

/**
 * Class representing a game server
 */
class GameServer {
    /**
     * @param  {io} _io - io
     */
    constructor(_io) {
        this._io = _io;
        this.roomManager = new Manager();

        this._io.on("connection", socket => {
            logger.info(`1 player connected! Online(s): ${this.getOnline()}`);
            // Event.RoomCreate(this, socket, {
            // 	text: "idk",
            // 	maxPlayer: 6,
            // 	mode: "Creative"
            // });
            socket.on("disconnect", data =>
                Event.Disconnect(this, socket, data)
            );
            // for (const FuncName in Event) {
            // 	socket.on(FuncName, data => Event[FuncName](this, socket, data));
            // }
            socket.on("ChangeName", data => Event.ChangeName(this, socket, data));
            socket.on("ChangeWeapon", data =>
                Event.ChangeWeapon(this, socket, data)
            );
            socket.on("Chat", data => Event.Chat(this, socket, data));
            socket.on("Refresh", data => Event.Refresh(this, socket, data));
            socket.on("Pingms", data => Event.Pingms(this, socket, data));
            socket.on("RoomCreate", data =>
                Event.RoomCreate(this, socket, data)
            );
            socket.on("RoomJoin", data => Event.RoomJoin(this, socket, data));
            socket.on("RoomLeave", data =>
                Event.RoomLeave(this, socket, data)
            );
            socket.on("UpdateLogkm", data =>
                Event.UpdateLogkm(this, socket, data)
            );
            socket.on("UpdateRotate", data =>
                Event.UpdateRotate(this, socket, data)
            );
        });
        logger.info("Game Server started!");
    }

    /**
     * @param  {Room} room - A object Room
     */
    destroyRoom(room) {
        this._io.emit("room delete", room.id);
        room.destroy();
        this.roomManager.delete(room);
    }

    /**
     * @return {Number} Number of onlines
     */
    getOnline() {
        return this._io.engine.clientsCount;
    }

    /**
     * @param  {String} socketID - ID of socket
     * @return {Room} The room which socket with id is socketID in
     */
	getRoomBySocketID(socketID) {
		const indexRoom = this.roomManager.items.findIndex(room => {
			if (
				room.playerManager.items.findIndex(
					player => player.id == socketID
				) != -1
			)
				return true;
			return false;
		});
		// if (indexRoom != -1)
		return this.roomManager.items[indexRoom];
		// return undefined;
	}
}

export default GameServer;
