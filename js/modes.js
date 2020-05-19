import { Config, Sprites, Weapons, _QuadTree, Shuffle } from "./utils.js";
const { REAL_SIZE, MINUS_SIZE, ITEM_CONFIG } = Config;
const random = require("random");

class Mode {
    constructor({
        master,
        id,
        text = "Join me now bro",
        maxPlayer,
        io
    } = {}) {
        this.id = id; // room id
        this.io = io;

        this.activeObjects = {};
        this.staticObjects = {};

        this.setting = {
            master,
            id,
            text,
            maxPlayer,
            playing: [],
            timeCreate: Date.now(),
            speed: 0
        }
        this.size = {
            width: 1500 + 400 * maxPlayer,
            height: 1000 + 300 * maxPlayer
        }

        this.interval;

        this.allWeapons = [{
                "name": "ak47",
                "bulletCount": 30,
                "magazine": 10
            },
            {
                "name": "m4a1",
                "bulletCount": 30,
                "magazine": 10
            },
            {
                "name": "awp",
                "bulletCount": 5,
                "magazine": 10
            },
            {
                "name": "paint",
                "bulletCount": 10,
                "magazine": 10
            },
            {
                "name": "shotgun",
                "bulletCount": 5,
                "magazine": 10
            },
            {
                "name": "chicken",
                "bulletCount": 100,
                "magazine": 0
            },
            {
                "name": "gatlin",
                "bulletCount": 200,
                "magazine": 1
            },
            {
                "name": "rpk",
                "bulletCount": 80,
                "magazine": 2
            },
            {
                "name": "uzi",
                "bulletCount": 25,
                "magazine": 10
            },
            {
                "name": "revolver",
                "bulletCount": 8,
                "magazine": 10
            },
            {
                "name": "p90",
                "bulletCount": 50,
                "magazine": 5
            },
            {
                "name": "rpg",
                "bulletCount": 100,
                "magazine": 0
            }
        ];

        this.activeQtree;
        this.staticQtree;
        this.qtreeSetting = {
            boundary: new _QuadTree.Rectangle(0, 0, this.size.width, this.size.height),
            split: 4
        }
    }

    sendUpdates() {
        let gameDatas = {};
        for (let groupName in this.activeObjects) {
            let group = this.activeObjects[groupName];
            let privateData, publicData;
            // private data nghia la nhung data khi trong truong hop dac biet se bi xoa di va emit rieng
            // public data emit cho toan bo nguoi choi trong room
            gameDatas[groupName] = [];
            for (let object of group) {
                switch (groupName) {
                    case "gunners":
                        {
                            let {
                                id,
                                name,
                                pos,
                                bag,
                                degree,
                                blood,
                                status,
                                size
                            } = object;

                            publicData = {
                                id,
                                name,
                                pos,
                                bag,
                                degree,
                                dead: blood <= 0,
                                blood,
                                size
                            };

                            // publicData = {
                            // };

                            // if (status.hideintree && blood > 0) { // neu dang tron va con song
                            //     this.io.to(id).emit("update game", {
                            //         groupName: "gunners",
                            //         data: { gunners: [
                            //             data: privateData
                            //         ]}
                            //     }); //update private là update chỉ riêng cho mình
                            //     privateData = undefined; // xóa đi vì riêng tư, ko đc gửi cho nguoi khac
                            // }
                            break;
                        }
                    case "bullets":
                        {
                            let {
                                id,
                                pos,
                                size,
                                name,
                                ownerID,
                                speed,
                                imgName
                            } = object;

                            publicData = {
                                id,
                                pos,
                                size,
                                name,
                                ownerID,
                                speed,
                                imgName
                            }
                            break;
                        }
                    case "scores":
                        {
                            let {
                                id,
                                pos,
                                value
                            } = object;

                            publicData = {
                                id,
                                pos,
                                value
                            }
                            break;
                        }
                }
                gameDatas[groupName].push(Object.assign({ id: object.id }, privateData, publicData));
            }
        }
        this.io.to(this.setting.id).emit("update game", gameDatas);
    }

    start() {
        let delay = 0,
            stackDelay = 0;
        this.interval = setInterval(() => {
            let timeStart = Date.now();

            if (delay <= 0) { // not delaying the room
                this.gameLoop();
                this.sendUpdates();

                // counting the proccesing speed
                this.setting.speed = Date.now() - timeStart;
                if (this.setting.speed / 30 > 1) { // room is not stable, lagging
                    delay = this.setting.speed / 30; // add delay to stabilize the room
                    stackDelay += delay;
                    if (stackDelay > 100) { // now the room is commit "not stable, need to do something"
                        this.io.to(this.setting.id).emit("dialog alert", "Phòng quá tải!");
                        this.destroy();
                    }
                } else {
                    if (stackDelay > 0)
                        stackDelay -= 0.5;
                }
            } else { // is delaying, room is not stable
                delay--;
            }

        }, 30);
    }

    gameLoop() {
        let biggestActiveDiameterRange = this._createActiveQtree(); // khac voi ham createStaticQtree(), ham nay co object.update()
        for (let groupName in this.activeObjects) {
            let group = this.activeObjects[groupName];
            for (let object of group) {
                let staticRange = new _QuadTree.Circle(object.pos.x, object.pos.y, this.biggestStaticDiameterRange + object.getQueryRange() + 1);
                let staticPoints = this.staticQtree.query(staticRange);
                for (let point of staticPoints) {
                    let { userData: pointData } = point;
                    if (object.intersect(pointData.getBoundary())) {
                        object.collide({
                            copy: {},
                            origin: pointData
                        });
                    }
                }

                let activeRange = new _QuadTree.Circle(object.pos.x, object.pos.y, biggestActiveDiameterRange + object.getQueryRange() + 1);
                let activePoints = this.activeQtree.query(activeRange);
                for (let point of activePoints) {
                    let { userData: pointData } = point;
                    if (pointData.origin.id == object.id)
                        continue;
                    if (object.intersect(pointData.origin.getBoundary())) {
                        object.collide(pointData);
                    }
                }
            }
        }
    }

    createMap(mode) {
        this.biggestStaticDiameterRange = 0;
        this.staticObjects.map = [];
        switch (mode) {
            case "random":
                for (let i = 0; i <= (70 / 2500) * this.size.width; i++) {
                    this.staticObjects.map.push(new Sprites.Sprite({
                        pos: {
                            x: random.float(-this.size.width / 2, this.size.width / 2).toFixed(1) - 0,
                            y: random.float(-this.size.height / 2, this.size.height / 2).toFixed(1) - 0
                        },
                        size: random.float(0.5, 1.5).toFixed(3) - 0, //add more size
                        defaultRange: 180,
                        degree: 0,
                        type: ["Rock", "Tree"][random.int(0, 1)],
                        id: i
                    }));
                    let newRange = this.staticObjects.map[this.staticObjects.map.length - 1].getQueryRange();
                    if (this.biggestStaticDiameterRange < newRange)
                        this.biggestStaticDiameterRange = newRange;
                }
                break;
            case "template":
                break;
        }
        this.createStaticQtree();
    }

    createStaticQtree() {
        let biggestDiameterRange = 0;
        this.staticQtree = new _QuadTree.QuadTree(this.qtreeSetting.boundary, this.qtreeSetting.split);
        for (let groupName in this.staticObjects) {
            let group = this.staticObjects[groupName];
            for (let object of group) {
                this.staticQtree.insert(new _QuadTree.Point(object.pos.x, object.pos.y, object));
                if (biggestDiameterRange < object.getQueryRange())
                    biggestDiameterRange = object.getQueryRange();
            }
        }
        return biggestDiameterRange; // range collide cao nhat (de query khong bi thieu)
    }

    _createActiveQtree() {
        this.activeQtree = new _QuadTree.QuadTree(this.qtreeSetting.boundary, this.qtreeSetting.split);
        // them object.update vi chay 2 lan vong lap ton thoi gian
        // insert vao sau 1 vat update se nhanh hon
        let biggestDiameterRange = 0;
        for (let groupName in this.activeObjects) {
            let group = this.activeObjects[groupName];
            for (let object of group) {
                if (object.delete) {
                    this.deleteObject(groupName, object.id);
                    continue;
                }
                object.update(this);
                this.activeQtree.insert(new _QuadTree.Point(object.pos.x, object.pos.y, {
                    copy: JSON.parse(JSON.stringify(object)),
                    origin: object
                }));

                if (biggestDiameterRange < object.getQueryRange())
                    biggestDiameterRange = object.getQueryRange();
            }
        }
        return biggestDiameterRange; // range collide cao nhat (de query khong bi thieu)
    }

    join(socket) { // kiem tra cac dieu dien de vao room
        return new Promise((resolve, reject) => {
            if (this.setting.playing.length < this.setting.maxPlayer) {
                let guns = [];
                // Shuffle(this.allWeapons);
                for (let i = 0; i < 2; i++) {
                    if (i > this.allWeapons.length - 1)
                        break;
                    let gunConfig = this.allWeapons[i];
                    gunConfig.ownerID = socket.id;
                    guns.push(new Weapons[ITEM_CONFIG[gunConfig.name].class](gunConfig));
                }
                socket.gunner = new Sprites.Terrorist({
                    id: socket.id,
                    name: socket.name,
                    pos: {
                        x: random.int(-this.size.width / 2, this.size.width / 2),
                        y: random.int(-this.size.height / 2, this.size.height / 2)
                    },
                    bag: {
                        arr: guns,
                        index: 0
                    },
                    defaultRange: 80
                });

                this.io.to(this.setting.id).emit("toast alert", `${socket.name} đã vào phòng!`);
                socket.join(this.setting.id, () => {
                    socket.emit("static objects", this.staticObjects)

                    this.addPlayer(socket); // tao player theo mode xong thi add vao activeObjects
                    resolve();
                });
            } else {
                reject("Phòng đã đủ người chơi :))");
            }
        })
    }

    disconnect(socket) {
        return new Promise((resolve, reject) => {
            let playing = this.setting.playing;
            playing.splice(playing.indexOf(socket.id), 1); // xóa player trong playing
            let index = this.activeObjects.gunners.findIndex(e => e.id == socket.gunner.id);
            this.activeObjects.gunners.splice(index, 1);
            if (index != -1)
                resolve();
            else
                reject();
        })
    }

    addPlayer(socket) { // them player vao room
        this.addObject("gunners", socket.gunner);
        this.setting.playing.push(socket.id);
    }

    addChat(text, socket) {
        if (text.length == 0 || text.length > 50 || Date.now() - socket.lastChat < 1000)
            return;

        this.io.to(this.setting.id).emit("room chat", {
            id: socket.id,
            text
        });
        socket.lastChat = Date.now();
    }

    addObject(group, data) {
        if (!this.activeObjects[group])
            this.activeObjects[group] = [];
        this.activeObjects[group].push(data);
    }

    deleteObject(group, id) {
        if (this.activeObjects[group]) {
            let index = this.activeObjects[group].findIndex(e => e.id == id);
            this.activeObjects[group].splice(index, 1);
            return true;
        }

        return false;
    }

    findObject(group, id) {
        if (this.activeObjects[group]) {
            let index = this.activeObjects[group].findIndex(e => e.id == id);
            if (index == -1)
                return false;
            else
                return this.activeObjects[group][index];
        }

        if (this.staticObjects[group]) {
            let index = this.staticObjects[group].findIndex(e => e.id == id);
            if (index == -1)
                return false;
            else
                return this.staticObjects[group][index];
        }

        return false;
    }

    destroy() { // xoa room
        clearInterval(this.interval);
        this.setting.playing.forEach(id => {
            this.io.sockets.connected[id].leave(this.setting.id);
        })
    }
}

class Creative extends Mode {
    constructor(config) {
        super(config);
        this.setting.mode = "creative";
        this.createMap("random");
    }
}

class King extends Mode {
    constructor(config) {
        super(config);
        this.setting.mode = "king";
        this.createMap("random");
        this.scoreInterval;
    }

    createScore() {
        this.addObject("scores", new Sprites.Score({
            id: Date.now(),
            name: Date.now() + "score",
            pos: {
                x: random.float(-this.size.width / 2, this.size.width / 2).toFixed(1) - 0,
                y: random.float(-this.size.width / 2, this.size.width / 2).toFixed(1) - 0
            },
            defaultRange: 10,
            value: random.int(5, 40)
        }));
    }

    start() {
        super.start();
        this.createScore();
        this.scoreInterval = setInterval(() => {
            if (this.activeObjects.scores.length < 20)
                this.createScore();
        }, 1000);
    }

    destroy() {
        clearInterval(this.scoreInterval);
        super.destroy();
    }
}

module.exports = {
    Mode,
    Creative,
    King
};