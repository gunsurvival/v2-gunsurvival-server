const { Circle, Rectangle, Point, QuadTree } = require("../my_modules/quadtree.js");
const { Sprite, Bullet, Human, Terrorist } = require(`./sprites.js`);
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
            timeCreate: Date.now()
        }
        this.size = {
            width: 1500 + 400 * maxPlayer,
            height: 1000 + 300 * maxPlayer
        }

        this.interval;

        this.allWeapons = [{
                "name": "ak47",
                "bulletCount": 30,
                "magazine": 10,
                "isReloading": false
            },
            {
                "name": "m4a1",
                "bulletCount": 30,
                "magazine": 10,
                "isReloading": false
            },
            {
                "name": "awp",
                "bulletCount": 5,
                "magazine": 10,
                "isReloading": false
            },
            {
                "name": "paint",
                "bulletCount": 10,
                "magazine": 10,
                "isReloading": false
            },
            {
                "name": "shotgun",
                "bulletCount": 5,
                "magazine": 10,
                "isReloading": false
            },
            {
                "name": "chicken",
                "bulletCount": 100,
                "magazine": 0,
                "isReloading": false
            },
            {
                "name": "gatlin",
                "bulletCount": 200,
                "magazine": 1,
                "isReloading": false
            },
            {
                "name": "rpk",
                "bulletCount": 80,
                "magazine": 2,
                "isReloading": false
            },
            {
                "name": "uzi",
                "bulletCount": 25,
                "magazine": 10,
                "isReloading": false
            },
            {
                "name": "revolver",
                "bulletCount": 8,
                "magazine": 10,
                "isReloading": false
            },
            {
                "name": "p90",
                "bulletCount": 50,
                "magazine": 5,
                "isReloading": false
            },
            {
                "name": "rpg",
                "bulletCount": 100,
                "magazine": 0,
                "isReloading": false
            }
        ];

        this.activeQtree;
        this.staticQtree;
        this.qtreeSetting = {
            // import dau ?
            boundary: new Rectangle(0, 0, this.size.width, this.size.height),
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
                                degree,
                                bag,
                                blood,
                                status
                            } = object;

                            // debugger;

                            publicData = {
                                id,
                                name,
                                pos,
                                degree,
                                bag,
                                dead: blood <= 0
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
                                owner,
                                speed,
                                imgName
                            } = object;

                            publicData = {
                                id,
                                pos,
                                size,
                                name,
                                owner,
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
                                size
                            } = object;

                            publicData = {
                                id,
                                pos,
                                size
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
        this.interval = setInterval(() => {
            this.gameLoop();
            this.sendUpdates();
        }, 30);
    }

    createMap(mode) {
        this.biggestStaticDiameterRange = 0;
        this.staticObjects.map = [];
        switch (mode) {
            case "random":
                for (let i = 0; i <= (70 / 2500) * this.size.width; i++) {
                    this.staticObjects.map.push(new Sprite({
                        pos: {
                            x: random.float(-this.size.width / 2, this.size.width / 2).toFixed(1) - 0,
                            y: random.float(-this.size.height / 2, this.size.height / 2).toFixed(1) - 0
                        },
                        size: random.float(0.5, 1.5).toFixed(3) - 0, //add more size
                        defaultRange: 180,
                        degree: 0,
                        type: ["Rock", "Tree"][random.int(0, 1)],
                        id: i,
                        getBoundary: function() {
                            return {
                                type: "Circle",
                                data: [this.pos.x, this.pos.y, this.getQueryRange()]
                            }
                        }
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
        this.staticQtree = new QuadTree(this.qtreeSetting.boundary, this.qtreeSetting.split);
        for (let groupName in this.staticObjects) {
            let group = this.staticObjects[groupName];
            for (let object of group) {
                this.staticQtree.insert(new Point(object.pos.x, object.pos.y, object));
                if (biggestDiameterRange < object.getQueryRange())
                    biggestDiameterRange = object.getQueryRange();
            }
        }
        return biggestDiameterRange; // range collide cao nhat (de query khong bi thieu)
    }

    _createActiveQtree() {
        this.activeQtree = new QuadTree(this.qtreeSetting.boundary, this.qtreeSetting.split);
        // them object.update vi chay 2 lan vong lap ton thoi gian
        // insert vao sau 1 vat update se nhanh hon
        let biggestDiameterRange = 0;
        for (let groupName in this.activeObjects) {
            let group = this.activeObjects[groupName];
            for (let object of group) {
                object.update(); // doc dong tren
                this.activeQtree.insert(new Point(object.pos.x, object.pos.y, object));
                if (biggestDiameterRange < object.getQueryRange())
                    biggestDiameterRange = object.getQueryRange();
            }
        }
        return biggestDiameterRange; // range collide cao nhat (de query khong bi thieu)
    }

    join(socket) { // kiem tra cac dieu dien de vao room
        return new Promise((resolve, reject) => {
            if (this.setting.playing.length < this.setting.maxPlayer) {
                socket.gunner = new Terrorist({
                    id: socket.id,
                    name: socket.name,
                    pos: {
                        x: random.int(-this.size.width / 2, this.size.width / 2),
                        y: random.int(-this.size.height / 2, this.size.height / 2)
                    },
                    bag: {
                        arr: [this.allWeapons[0], this.allWeapons[1]],
                        index: 0
                    },
                    defaultRange: 80,
                    getBoundary: function() {
                        return {
                            type: "Circle",
                            data: [this.pos.x, this.pos.y, this.getQueryRange()]
                        }
                    }
                });

                this.io.to(this.setting.id).emit("toast alert", `${socket.name} đã vào phòng!`);
                socket.join(this.setting.id);
                socket.emit("static objects", this.staticObjects)

                this.addPlayer(socket); // tao player theo mode xong thi add vao activeObjects
                resolve();
            } else {
                reject("Phòng đã đủ người chơi :))");
            }
        })
    }

    addPlayer(socket) { // them player vao room
        if (!this.activeObjects.gunners)
            this.activeObjects.gunners = [];
        this.activeObjects.gunners.push(socket.gunner);
        this.setting.playing.push(socket.id);
    }

    addChat(text, socket) {
        if (text.length > 50 && Date.now() - socket.lastChat < 1000)
            return;

        this.io.to(this.setting.id).emit("room chat", {
            id: socket.id,
            text
        });
        socket.lastChat = Date.now();
    }

    destroy() { // xoa room
        clearInterval(this.interval);
        this.io.to(this.id).emit("room destroy");
        this.io.sockets.clients(this.id).forEach(function(s) {
            s.leave(this.id);
        });
    }
}

class Creative extends Mode {
    constructor(config) {
        super(config);
        this.setting.mode = "creative";
        this.createMap("random");
    }

    gameLoop() {
        let biggestActiveDiameterRange = this._createActiveQtree(); // khac voi ham createStaticQtree(), ham nay co object.update()
        for (let groupName in this.activeObjects) {
            let group = this.activeObjects[groupName];
            for (let object of group) {
                let staticRange = new Circle(object.pos.x, object.pos.y, this.biggestStaticDiameterRange + object.getQueryRange() + 1);
                let staticPoints = this.staticQtree.query(staticRange);
                for (let point of staticPoints) {
                    // debugger;
                    let { userData: pointData } = point;
                    if (object.intersect(pointData.getBoundary()))
                        object.collide(pointData);
                }

                let activeRange = new Circle(object.pos.x, object.pos.y, biggestActiveDiameterRange + object.getQueryRange() + 1);
                let activePoints = this.activeQtree.query(activeRange);
                for (let point of activePoints) {
                    let { userData: pointData } = point;
                    if (object.intersect(pointData.getBoundary()))
                        object.collide(pointData);
                }
            }
        }
    }
}

class King extends Mode {
    constructor(config) {
        super(config);
        this.setting.mode = "king";
        this.createMap("random");
    }
}

module.exports = {
    Mode,
    Creative,
    King
};