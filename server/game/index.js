import logger from "node-color-log";
import Manager from "./helper/Manager.js";
import * as event from "./event";

class GameServer {
    constructor(_io) {
        this._io = _io;
        this.roomManager = new Manager(this._io); // _io is "io"

        this._io.on("connection", socket => {
            logger.info(`1 player connected! Online(s): ${this.getOnline()}`);
            // event.RoomCreate(this, socket, {
            // 	text: "idk",
            // 	maxPlayer: 6,
            // 	mode: "Creative"
            // });
            socket.on("disconnect", data =>
                event.Disconnect(this, socket, data)
            );
            // for (const FuncName in event) {
            // 	socket.on(FuncName, data => event[FuncName](this, socket, data));
            // }
            socket.on("UpdateData", data =>
                event.UpdateData(this, socket, data)
            );
            socket.on("ChangeWeapon", data =>
                event.ChangeWeapon(this, socket, data)
            );
            socket.on("Chat", data => event.Chat(this, socket, data));
            socket.on("Refresh", data => event.Refresh(this, socket, data));
            socket.on("Pingms", data => event.Pingms(this, socket, data));
            socket.on("RoomCreate", data =>
                event.RoomCreate(this, socket, data)
            );
            socket.on("RoomJoin", data => event.RoomJoin(this, socket, data));
            socket.on("RoomLeave", data =>
                event.RoomLeave(this, socket, data)
            );
            socket.on("UpdateLogkm", data =>
                event.UpdateLogkm(this, socket, data)
            );
            socket.on("UpdateRotate", data =>
                event.UpdateRotate(this, socket, data)
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
