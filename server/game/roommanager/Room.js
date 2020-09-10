import * as Mode from "../mode/";
import QuadTreeUtil from "../helper/quadtree.js";
import Manager from "../helper/Manager.js";
import Player from "./Player.js";

class Room {
    constructor({
        _io,
        id,
        master,
        text,
        maxPlayer,
        mode,
        timeCreate = Date.now(),
        gameOption = {}
    }) {
        this._io = _io;
        this.id = id;
        this.master = master;
        this.text = text;
        this.maxPlayer = maxPlayer;
        this.mode = mode;
        this.timeCreate = timeCreate;
        this.playerManager = new Manager();

        this.game = new Mode[mode](Object.assign({
            _io,
            id,
            maxPlayer,
        }, gameOption));
    }

    destroy() {
        for (const player of this.playerManager.items) {
            player._io.leave(this.id);
        }
        this.game.destroy();
    }

    getData() {
        const playing = [];
        for (const player of this.playerManager.items) {
            playing.push(player.id);
        }
        return {
            id: this.id,
            master: this.master,
            text: this.text,
            maxPlayer: this.maxPlayer,
            playing,
            timeCreate: this.timeCreate
        };
    }

    addChat(text, idSprite) {
        const sprite = this.game.playerManager.find({
            id: idSprite
        });
        if (!sprite || sprite.isChatting()) // prevent spamming chat
            return;

        if (sprite.isBot) { // you are bot then you cant talk to other bots
            return;
        }
        this._io.to(this.id).emit("chat", text);
        // const range = new QuadTreeUtil.Circle(
        //     socket.gunner.pos.x,
        //     socket.gunner.pos.y,
        //     500
        // );
        // const points = this.game.activeQtree.query(range);
        // for (const point of points) {
        //     const { userData: pointData } = point;
        //     if (pointData.copy.isBot) {
        //         const { degree, pos } = socket.gunner;
        //         const radianMe = (degree * Math.PI) / 180;
        //         const vt1 = {
        //             x: Math.cos(radianMe),
        //             y: Math.sin(radianMe)
        //         };
        //         const mag1 = Math.sqrt(
        //             Math.pow(vt1.x, 2) + Math.pow(vt1.y, 2)
        //         );
        //         const radianMeBot = Math.atan2(
        //             pointData.origin.pos.y - pos.y,
        //             pointData.origin.pos.x - pos.x
        //         );
        //         const vt2 = {
        //             x: Math.cos(radianMeBot),
        //             y: Math.sin(radianMeBot)
        //         };
        //         const mag2 = Math.sqrt(
        //             Math.pow(vt2.x, 2) + Math.pow(vt2.y, 2)
        //         );
        //         const angleBetween =
        //             Math.acos(vt1.x * vt2.x + vt1.y * vt2.y) /
        //             (mag1 * mag2);
        //         if ((angleBetween * 180) / Math.PI < 30)
        //             pointData.origin.reply(text, this);
        //     }
        // }
    }

    socketJoin(socket) {
        // kiem tra cac dieu dien de vao room
        return new Promise((resolve, reject) => {
            if (this.playerManager.find({
                    id: socket.id
                })) {
                return reject("Bạn đã join phòng khác!");
            }
            if (this.playerManager.getLength() < this.maxPlayer) {
                socket.join(this.id, () => {
                    const player = this.playerManager.add(new Player({
                        _socket: socket,
                        id: socket.id,
                        name: socket.name || "idk"
                    }));
                    this.game.addPlayer(player);
                    resolve(player);
                });
            } else {
                reject("Phòng đã đủ người chơi :))");
            }
        });
    }

    socketDisconnect(socket) {
        this.playerManager.delete(this.playerManager.find({
            id: socket.id
        }));
        // const index = this.activeObjects.gunners.findIndex(e => e.id == socket.gunner.id);
        // this.activeObjects.gunners.splice(index, 1);
        // if (index != -1)
        //     resolve();
        // else
        //     reject();
        // cai tren cho Mode.delete(); (this.game)
    }
}

export default Room;