import logger from "node-color-log";
import Manager from "./helper/Manager.js";
import * as events from "./events";

class GameServer {
    constructor(_io) {
        this._io = _io;
        this.roomManager = new Manager(this._io); // _io is "io"

        this._io.on("connection", socket => {
            logger.info(`1 player connected! Online(s): ${this.getOnline()}`);
            // events.RoomCreate(this, socket, {
            // 	text: "idk",
            // 	maxPlayer: 6,
            // 	mode: "Creative"
            // });
            socket.on("disconnect", data =>
                events.Disconnect(this, socket, data)
            );
            // for (const FuncName in events) {
            // 	socket.on(FuncName, data => events[FuncName](this, socket, data));
            // }
            socket.on("UpdateData", data =>
                events.UpdateData(this, socket, data)
            );
            socket.on("ChangeWeapon", data =>
                events.ChangeWeapon(this, socket, data)
            );
            socket.on("Chat", data => events.Chat(this, socket, data));
            socket.on("Refresh", data => events.Refresh(this, socket, data));
            socket.on("Pingms", data => events.Pingms(this, socket, data));
            socket.on("RoomCreate", data =>
                events.RoomCreate(this, socket, data)
            );
            socket.on("RoomJoin", data => events.RoomJoin(this, socket, data));
            socket.on("RoomLeave", data =>
                events.RoomLeave(this, socket, data)
            );
        });
        logger.info("Game Server started!");
    }

    destroyRoom(room) {
        this._io.emit("room delete", room.id);
        room.destroy();
        this.roomManager.delete(room);
    }

    getOnline() {
        return this._io.engine.clientsCount;
    }

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
