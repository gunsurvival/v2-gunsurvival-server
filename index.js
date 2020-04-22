function shuffle(arr) { // thuật toán bogo-sort
    let count = arr.length,
        temp, index;

    while (count > 0) {
        index = Math.floor(Math.random() * count);
        count--;
        temp = arr[count];
        arr[count] = arr[index];
        arr[index] = temp;
    }

    return arr; //Bogosort with no điều kiện dừng
}

const KEY_NAME = {
    16: 'shift',
    82: 'r',
    71: 'g'
}

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const random = require('random');
const port = process.env.PORT || 80;
let listImages = [];
const direction = {
    87: 'up',
    65: 'left',
    83: 'down',
    68: 'right'
};
const WORLDSIZE = {
    width: 3000,
    height: 2000
}
const { Worker } = require('worker_threads');
let rooms = [];
let roomIDJoined = {}; // check id room of stranger
let roomIDTick = 10000;
let workers = [];

let allWeapons = [{
        name: 'ak47',
        bulletCount: 30,
        magazine: 10,
        isReloading: false
    },
    {
        name: 'm4a1',
        bulletCount: 30,
        magazine: 10,
        isReloading: false
    },
    {
        name: 'awp',
        bulletCount: 5,
        magazine: 10,
        isReloading: false
    },
    {
        name: 'paint',
        bulletCount: 10,
        magazine: 10,
        isReloading: false
    },
    {
        name: 'shotgun',
        bulletCount: 5,
        magazine: 10,
        isReloading: false
    },
    {
        name: 'chicken',
        bulletCount: 100,
        magazine: 0,
        isReloading: false
    },
    {
        name: 'gatlin',
        bulletCount: 200,
        magazine: 1,
        isReloading: false
    },
    {
        name: 'rpk',
        bulletCount: 80,
        magazine: 2,
        isReloading: false
    },
    {
        name: 'uzi',
        bulletCount: 25,
        magazine: 10,
        isReloading: false
    },
    {
        name: 'revolver',
        bulletCount: 8,
        magazine: 10,
        isReloading: false
    },
    {
        name: 'p90',
        bulletCount: 50,
        magazine: 5,
        isReloading: false
    }
]

const getRoom = function(socket) {
    let roomID = roomIDJoined[socket.id]; // checking if user do join a room
    if (!roomID) {
        return;
    }
    let roomIndex = rooms.findIndex(e => e.setting.id == roomID);
    if (roomIndex == -1) { // checking exist of room join id
        return;
    }
    return rooms[roomIndex];
}

function clearArray(arr, method) {
    switch (method) {
        case 1:
            arr.length = 0;
            break;
        case 2:
            arr.splice(0, arr.length);
            break;
        case 3:
            while (arr.length > 0) {
                arr.pop();
            }
            break;
    }
}

let addWorker = (socket) => {
    let room = getRoom(socket);
    if (!room) return;
    let { setting, map, gunners } = room;

    let indexG = gunners.findIndex(e => e.id == socket.id);
    if (indexG == -1)
        return;
    let gunner = gunners[indexG];

    workers.push({
        id: gunner.id,
        worker: new Worker(__dirname + '/service.js', {
            workerData: {
                gunners,
                map,
                myIndex: indexG,
                worldSize: WORLDSIZE
            }
        })
    })

    let worker = workers[workers.length - 1].worker;

    worker.on('message', result => {
        //blood of mine
        if (gunner.blood != result.blood) {
            socket.emit('update blood', result.blood);
            gunner.blood = result.blood;
            if (gunner.blood <= 0) {
                io.to(setting.id).emit('gunner dead', {
                    id: gunner.id,
                    killedBy: result.killedBy
                });
                io.to(result.killedBy).emit('toast alert', 'You have killed : ' + gunner.name);
                gunner.killedBy = result.killedBy;
                gunner.blood = 0;
                gunner.dead = true;
                clearArray(result.bullets, 2);
                io.to(setting.id).emit('spliceTreeShake', result.treesCollide.normalArr);
                worker.terminate();
            }
        }

        //update bag
        let gun = gunner.bag.arr[gunner.bag.index];
        if (typeof(gun) == "undefined")
            return;
        let indexGun = result.bagArr.findIndex(e => e.name == gun.name);
        if (indexGun != -1) {
            let updateGun = result.bagArr[indexGun];
            if (gun.isReloading !== updateGun.isReloading) {
                if (updateGun.isReloading)
                    io.to(setting.id).emit('gun reloading', socket.id);
                else
                    socket.emit('gun reloaded', updateGun);
            }
            gunner.bag.arr = result.bagArr;
        }

        //cool down gun or bullet 
        gunner.holdingCoolDown = result.holdingCoolDown;

        //bullet of mine
        let bullets = result.bullets;

        for (let bullet of result.deleteBullets) {
            let gIndex = gunners.findIndex(e => e.id == bullet.owner);
            if (gIndex == -1) continue;
            let bIndex = gunners[gIndex].bullets.findIndex(e => e.id == bullet.id);
            if (bIndex == -1) continue;
            gunners[gIndex].bullets[bIndex].deleteByOtherUser = true;
        }

        for (let i = 0; i < gunner.bullets.length; i++) {
            let bullet = gunner.bullets[i];
            if (bullets.findIndex(e => e.id == bullet.id) == -1) {
                gunner.bullets.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i];
            let indexBullet = gunner.bullets.findIndex(e => e.id == bullet.id);
            if (indexBullet == -1) {
                gunner.bullets.push(bullet);
            } else {
                if (gunner.bullets[indexBullet].deleteByOtherUser)
                    bullet.delete = true;
                gunner.bullets[indexBullet] = bullet;
            }
        }

        //position of mine
        gunner.pos = result.position;
        if (result.treesCollide.addArr.length > 0) {
            io.to(setting.id).emit('addTreeShake', result.treesCollide.addArr);
        }

        //tree collide
        if (result.treesCollide.spliceArr.length > 0) {
            io.to(setting.id).emit('spliceTreeShake', result.treesCollide.spliceArr);
        }

        if (result.treesCollide.normalArr.length > 0) { // check if hide in a tree(s)
            if (!gunner.status.hideintree)
                io.to(setting.id).emit('hideintree', { // invisible = true
                    id: socket.id
                });
            gunner.status.hideintree = true;
        } else { // check if not hiding any tree
            if (gunner.status.hideintree)
                io.to(setting.id).emit('unhideintree', { // invisible = false
                    id: socket.id,
                    pos: gunner.pos
                });
            gunner.status.hideintree = false;
        }

        // ------------lam xong cac cong viec tren thi gui lai gia tri cho service-----------
        worker.postMessage({
            name: "request",
            gunners,
            map,
            myIndex: gunners.indexOf(gunner)
        });
        // -----------------------lam xong cac cong viec tren thi gui lai gia tri---------------
    })
}


app.use(cors());
app.use(express.static(__dirname + '/assets'));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Apache is functioning normally<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>đùa thôi :v server nodejs mà ;))');
})

app.get('/list-images', (req, res) => {
    res.send(listImages);
})

app.post('/mapeditor', function(req, res) {
    let error = true;
    let mapJSON;
    if (typeof req.body.map == "string") {
        try {
            error = false;
            mapJSON = JSON.parse(req.body.map);
        } catch (e) {
            error = true;
        }
    }

    if (error) {
        res.send({
            icon: 'error',
            title: ':(',
            text: 'ko đọc đc map'
        })
    } else {
        res.send({
            icon: 'success',
            title: 'K',
            text: 'ok'
        })
        console.log(req.body.map);
    }
});

io.on('connection', function(socket) {
    console.log('1 player connected, online: ' + io.engine.clientsCount);
    io.emit('online', io.engine.clientsCount);

    socket.name = socket.id;

    socket.on('name', name => {
        if (name.length <= 20) {
            name = name.split('<').join('');
            name = name.split('>').join('');
            name = name.split('/').join('');
            socket.name = name;
        }
    })

    socket.on('room chat', text => {
        let room = getRoom(socket);
        if (!room) return;

        if (text.length > 50 || Date.now() - socket.lastChat < 1000)
            return;

        text = text.split('<').join('');
        text = text.split('>').join('');
        text = text.split('/').join('');

        io.to(room.setting.id).emit('room chat', {
            id: socket.id,
            text
        });
        socket.lastChat = Date.now();
    })

    socket.on('room create', ({ text, maxPlayer } = {}) => {
        if (getRoom(socket))
            return;

        if (maxPlayer < 5 || maxPlayer > 15 || isNaN(maxPlayer)) {
            socket.emit('dialog alert', 'hack cc');
            return;
        }
        text = text.split('<').join('');
        text = text.split('>').join('');
        text = text.split('/').join('');
        rooms.push({
            map: [],
            gunners: [],
            setting: {
                master: socket.name,
                id: roomIDTick++,
                text: text || "Join me now bro",
                maxPlayer: maxPlayer || 3,
                time: Date.now(),
                playing: []
            }
        })

        let room = rooms[rooms.length - 1];
        let { gunners, map, setting } = room;

        let roomID = setting.id;
        // room.map = JSON.parse(`[{"pos":{"x":-250,"y":-200},"size":1,"degree":0,"name":"Tree","id":0},{"pos":{"x":250,"y":-200},"size":1,"degree":0,"name":"Tree","id":1},{"pos":{"x":-250,"y":200},"size":1,"degree":0,"name":"Tree","id":2},{"pos":{"x":300,"y":200},"size":1,"degree":0,"name":"Tree","id":3},{"pos":{"x":562.5,"y":0},"size":1,"degree":0,"name":"Rock","id":4},{"pos":{"x":0,"y":-412.5},"size":1,"degree":0,"name":"Rock","id":5},{"pos":{"x":-525,"y":0},"size":1,"degree":0,"name":"Rock","id":6},{"pos":{"x":37.5,"y":412.5},"size":1,"degree":0,"name":"Rock","id":7},{"pos":{"x":472.50000000000006,"y":-402.5},"size":1,"degree":0,"name":"Box_wooden","id":8},{"pos":{"x":0,"y":-700},"size":1,"degree":0,"name":"Box_wooden","id":9},{"pos":{"x":-440,"y":-400},"size":1,"degree":0,"name":"Box_wooden","id":10},{"pos":{"x":-440,"y":440},"size":1,"degree":0,"name":"Box_wooden","id":11},{"pos":{"x":520,"y":400},"size":1,"degree":0,"name":"Box_wooden","id":12},{"pos":{"x":250,"y":0},"size":1,"degree":0,"name":"Box_emty","id":13},{"pos":{"x":25,"y":200},"size":1,"degree":0,"name":"Box_emty","id":14},{"pos":{"x":-225,"y":0},"size":1,"degree":0,"name":"Box_emty","id":15},{"pos":{"x":0,"y":-200},"size":1,"degree":0,"name":"Box_emty","id":16}]`);

        for (let i = 0; i <= 70; i++) {
            map.push({
                pos: {
                    x: random.float(-WORLDSIZE.width / 2, WORLDSIZE.width / 2).toFixed(2) - 0,
                    y: random.float(-WORLDSIZE.height / 2, WORLDSIZE.height / 2).toFixed(2) - 0
                },
                size: random.float(0.5, 1.5).toFixed(3) - 0, //add more size
                degree: 0,
                type: ['Rock', 'Tree'][random.int(0, 1)],
                id: i
            })
        }

        setTimeout(() => {
            if (room.setting.playing.length <= 0) {
                clearInterval(room.interval);
                rooms.splice(rooms.findIndex(e => e.id == room.setting.id), 1);
                io.emit('room delete', room.setting.id);
                return;
            }
        }, 5000);

        room.interval = setInterval(() => {
            let gunnersData = [];
            for (let gunner of gunners) {
                let { name, pos, degree, bag, bullets, dead, blood } = gunner;
                let privateData = { // private data nghĩa là khi nào đc sự cho phép của server thì client mới đọc đc (ví dụ trốn trong cây thì ko gửi)
                    name,
                    pos,
                    degree,
                    bag
                }

                let publicData = { // public data đc client đọc 1 cách tự do
                    bulletsData: bullets, // vì trùng tên trong client nên đổi
                    dead: blood <= 0
                }

                if (gunner.status.hideintree) {
                    io.to(gunner.id).emit('update private', privateData); //update private là update chỉ riêng cho mình
                    privateData = undefined; // xóa đi vì riêng tư, ko đc gửi cho tất cả user
                }

                gunnersData.push({
                    id: gunner.id,
                    privateData,
                    publicData
                })
            }
            io.to(roomID).emit('update game', gunnersData);
        }, 30)

        io.emit('room create', room.setting);
        socket.emit('room created', roomID);
    })

    socket.on('room respawn', () => {
        let room = getRoom(socket);
        if (!room) return;
        let { setting, map, gunners } = room;
        let indexG = gunners.findIndex(e => e.id == socket.id);
        if (indexG == -1)
            return;
        let gunner = gunners[indexG];
        if (!gunner.dead)
            return;
        gunner.dead = false;
        gunner.blood = 100;
        gunner.holdingCoolDown = 0;
        gunner.pos.x = random.int(-WORLDSIZE.width / 2, WORLDSIZE.width / 2);
        gunner.pos.y = random.int(-WORLDSIZE.height / 2, WORLDSIZE.height / 2);
        gunner.move.up = false;
        gunner.move.down = false;
        gunner.move.left = false;
        gunner.move.right = false;
        delete gunner.keydown;
        gunner.keydown = {};
        gunner.firing = false;
        shuffle(allWeapons);
        clearArray(gunner.bag.arr, 2);
        gunner.bag.arr = [{ ...allWeapons[0] }, { ...allWeapons[1] }];
        gunner.bag.index = 0;
        io.to(socket.id).emit('room respawn private', gunner.bag);
        io.to(setting.id).emit('room respawn public', socket.id, gunner.bag.arr[gunner.bag.index]);
        addWorker(socket);
    })

    socket.on('room join', (joinRoomID) => {
        if (getRoom(socket)) return;

        let roomID = joinRoomID;
        let roomIndex = rooms.findIndex(e => e.setting.id == roomID);
        if (roomIndex == -1) // checking exist of room join id
            return socket.emit('dialog alert', {
                text: "Không tìm thấy phòng",
                preConfirm_string: "socket.emit('rooms update');"
            });

        let room = rooms[roomIndex];
        let { setting, map, gunners } = room;

        if (setting.playing.length >= setting.maxPlayer) {
            socket.emit('dialog alert', "Phòng đã đủ người chơi :))");
            return;
        }

        socket.emit('map', map);
        socket.join(joinRoomID, () => {
            roomIDJoined[socket.id] = joinRoomID;
            setting.playing.push(socket.id);
            io.emit('room update', setting); // update room table

            shuffle(allWeapons);

            gunners.push({
                type: "Gunner",
                name: socket.name,
                size: 1,
                id: socket.id,
                move: {
                    up: false,
                    down: false,
                    left: false,
                    right: false
                },
                pos: {
                    x: random.int(-WORLDSIZE.width / 2, WORLDSIZE.width / 2),
                    y: random.int(-WORLDSIZE.height / 2, WORLDSIZE.height / 2)
                },
                degree: 0,
                status: {
                    hideintree: false
                },
                bullets: [],
                firing: false,
                blood: 100,
                killedBy: 'i dont know :/',
                bag: {
                    arr: [{ ...allWeapons[0] }, { ...allWeapons[1] }],
                    index: 0,
                },
                holdingCoolDown: 0,
                keydown: {}
            });

            let indexGunner = gunners.length - 1;
            let gunner = gunners[indexGunner];

            map.push({
                id: gunner.id,
                type: "Bullet",
                arr: gunner.bullets
            })

            //worker job (có nhiều loại worker cho mỗi mode)

            addWorker(socket);

            // io.to(roomID).emit('new gunner', gunner);
        });
    })

    socket.on('room leave', () => {
        let room = getRoom(socket);
        if (!room) return;
        let { setting, map, gunners } = room;

        io.to(setting.id).emit('room leave', socket.id);

        socket.leave(setting.id, () => {
            delete roomIDJoined[socket.id];

            let indexWorker = workers.findIndex(e => e.id == socket.id); // xóa worker và service
            if (indexWorker != -1) {
                workers[indexWorker].worker.terminate();
                workers.splice(indexWorker, 1);
            }

            setting.playing.splice(setting.playing.indexOf(socket.id), 1); // xóa người chơi
            if (setting.playing.length <= 0) {
                clearInterval(room.interval);
                rooms.splice(rooms.findIndex(e => e.id == setting.id), 1);
                io.emit('room delete', setting.id);
                return;
            }

            let indexGunner = gunners.findIndex(e => e.id == socket.id);
            let indexMap = map.findIndex(e => e.id == gunners[indexGunner].id);
            map.splice(indexMap, 1);
            gunners.splice(indexGunner, 1);
            io.emit('room update', setting);
        });
    })

    //---------------------------------------------

    socket.on('disconnect', () => {
        console.log('1 player disconnected, online: ' + io.engine.clientsCount);
        io.emit('online', io.engine.clientsCount);
        let room = getRoom(socket);
        if (!room) return;
        let { setting, map, gunners } = room;

        let indexWorker = workers.findIndex(e => e.id == socket.id);
        if (indexWorker != -1) {
            workers[indexWorker].worker.terminate();
            workers.splice(indexWorker, 1);
        }

        setting.playing.splice(setting.playing.indexOf(socket.id), 1); // xóa player trong playing

        if (setting.playing.length <= 0) { // nếu ko có ai trong phòng thì xóa phòng
            clearInterval(room.interval);
            rooms.splice(rooms.findIndex(e => e.id == setting.id), 1);
            io.emit('room delete', setting.id);
            return;
        }

        let indexGunner = gunners.findIndex(e => e.id == socket.id);
        let indexMap = map.findIndex(e => e.id == gunners[indexGunner].id);
        map.splice(indexMap, 1); // xóa đạn của người thoát phòng
        gunners.splice(indexGunner, 1); // xóa người đó
        delete roomIDJoined[socket.id]; // xóa room id người đó
        io.to(setting.id).emit('room leave', socket.id);
        io.emit('room update', setting);
    })

    socket.on('gunner degree', (degree) => {
        let room = getRoom(socket);
        if (!room) return;
        let { gunners, setting } = room;

        let indexGunner = gunners.findIndex(e => e.id == socket.id);
        if (indexGunner == -1) return;
        gunners[indexGunner].degree = degree;;
    })

    socket.on('pingms', time => {
        socket.emit('pingms', time);
    })

    socket.on('keydown', keycode => {
        let room = getRoom(socket);
        if (!room) return;
        let { gunners } = room;

        let indexGunner = gunners.findIndex(e => e.id == socket.id);
        if (indexGunner == -1) return;
        let gunner = gunners[indexGunner];

        if ([87, 65, 83, 68].indexOf(keycode) != -1)
            gunner.move[direction[keycode]] = true;

        gunner.keydown[KEY_NAME[keycode] || "idk"] = true;
    })

    socket.on('keyup', keycode => {
        let room = getRoom(socket);
        if (!room) return;
        let { gunners } = room;

        let indexGunner = gunners.findIndex(e => e.id == socket.id);
        if (indexGunner == -1) return;
        let gunner = gunners[indexGunner];

        if ([87, 65, 83, 68].indexOf(keycode) != -1)
            gunner.move[direction[keycode]] = false;

        gunner.keydown[KEY_NAME[keycode] || "idk"] = false;
    })

    socket.on('firedown', () => {
        let room = getRoom(socket);
        if (!room) return;
        let { gunners } = room;

        let indexGunner = gunners.findIndex(e => e.id == socket.id);
        if (indexGunner == -1) return;
        let gunner = gunners[indexGunner];
        gunner.firing = true;
    })

    socket.on('fireup', () => {
        let room = getRoom(socket);
        if (!room) return;
        let { gunners } = room;

        let indexGunner = gunners.findIndex(e => e.id == socket.id);
        if (indexGunner == -1) return;
        let gunner = gunners[indexGunner];
        gunner.firing = false;
    })

    socket.on('rooms update', () => {
        let roomSettings = [];
        for (let room of rooms)
            roomSettings.push(room.setting);
        socket.emit('rooms update', roomSettings);
    })

    socket.on('weapon change', data => {
        let room = getRoom(socket);
        if (!room) return;
        let { gunners } = room;

        let indexGunner = gunners.findIndex(e => e.id == socket.id);
        if (indexGunner == -1) return;
        let gunner = gunners[indexGunner];
        let bag = gunner.bag;
        switch (data.method) {
            case "number":
                if (data.value == bag.index)
                    return;
                if (data.value <= bag.arr.length - 1 && data.value >= 0)
                    bag.index = data.value;
                break;
            case "wheel":
                if (data.value > 0)
                    bag.index++;
                else
                    bag.index--;
                break;
        }
        if (bag.index > bag.arr.length - 1)
            bag.index = 0
        if (bag.index < 0)
            bag.index = bag.arr.length - 1;
        io.emit('weapon change', {
            id: socket.id,
            gun: bag.arr[bag.index]
        })
    })
});

http.listen(port, function() {
    console.log('listening on *:' + port);
    fs.readdir(path.join(__dirname, 'assets/img'), function(err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function(file) {
            if (/^(.*)\-min\.png$/.test(file))
                listImages.push(file);
        });
    });
});