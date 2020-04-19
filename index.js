// class Point{constructor(t,e,i){this.x=t,this.y=e,this.userData=i}}class Rectangle{constructor(t,e,i,s){this.x=t,this.y=e,this.w=i,this.h=s}get left(){return this.x-this.w/2}get right(){return this.x+this.w/2}get top(){return this.y-this.h/2}get bottom(){return this.y+this.h/2}contains(t){return t.x>=this.x-this.w&&t.x<=this.x+this.w&&t.y>=this.y-this.h&&t.y<=this.y+this.h}intersects(t){return!(t.x-t.w>this.x+this.w||t.x+t.w<this.x-this.w||t.y-t.h>this.y+this.h||t.y+t.h<this.y-this.h)}}class Circle{constructor(t,e,i){this.x=t,this.y=e,this.r=i,this.rSquared=this.r*this.r}contains(t){return Math.pow(t.x-this.x,2)+Math.pow(t.y-this.y,2)<=this.rSquared}intersects(t){let e=Math.abs(t.x-this.x),i=Math.abs(t.y-this.y),s=this.r,h=t.w,r=t.h,n=Math.pow(e-h,2)+Math.pow(i-r,2);return!(e>s+h||i>s+r)&&(e<=h||i<=r||n<=this.rSquared)}}class QuadTree{constructor(t,e){if(!t)throw TypeError("boundary is null or undefined");if(!(t instanceof Rectangle))throw TypeError("boundary should be a Rectangle");if("number"!=typeof e)throw TypeError(`capacity should be a number but is a ${typeof e}`);if(e<1)throw RangeError("capacity must be greater than 0");this.boundary=t,this.capacity=e,this.points=[],this.divided=!1}static create(){if(0===arguments.length){if("undefined"==typeof width)throw new TypeError("No global width defined");if("undefined"==typeof height)throw new TypeError("No global height defined");let t=new Rectangle(width/2,height/2,width,height);return new QuadTree(t,8)}if(arguments[0]instanceof Rectangle){let t=arguments[1]||8;return new QuadTree(arguments[0],t)}if("number"==typeof arguments[0]&&"number"==typeof arguments[1]&&"number"==typeof arguments[2]&&"number"==typeof arguments[3]){let t=arguments[4]||8;return new QuadTree(new Rectangle(arguments[0],arguments[1],arguments[2],arguments[3]),t)}throw new TypeError("Invalid parameters")}toJSON(t){let e={points:this.points};return this.divided&&(this.northeast.points.length>0&&(e.ne=this.northeast.toJSON(!0)),this.northwest.points.length>0&&(e.nw=this.northwest.toJSON(!0)),this.southeast.points.length>0&&(e.se=this.southeast.toJSON(!0)),this.southwest.points.length>0&&(e.sw=this.southwest.toJSON(!0))),t||(e.capacity=this.capacity,e.x=this.boundary.x,e.y=this.boundary.y,e.w=this.boundary.w,e.h=this.boundary.h),e}static fromJSON(t,e,i,s,h,r){if(void 0===e){if(!("x"in t))throw TypeError("JSON missing boundary information");e=t.x,i=t.y,s=t.w,h=t.h,r=t.capacity}let n=new QuadTree(new Rectangle(e,i,s,h),r);if(n.points=t.points,"ne"in t||"nw"in t||"se"in t||"sw"in t){let e=n.boundary.x,i=n.boundary.y,s=n.boundary.w/2,h=n.boundary.h/2;n.northeast="ne"in t?QuadTree.fromJSON(t.ne,e+s,i-h,s,h,r):new QuadTree(new Rectangle(e+s,i-h,s,h),r),n.northwest="nw"in t?QuadTree.fromJSON(t.nw,e-s,i-h,s,h,r):new QuadTree(new Rectangle(e-s,i-h,s,h),r),n.southeast="se"in t?QuadTree.fromJSON(t.se,e+s,i+h,s,h,r):new QuadTree(new Rectangle(e+s,i+h,s,h),r),n.southwest="sw"in t?QuadTree.fromJSON(t.sw,e-s,i+h,s,h,r):new QuadTree(new Rectangle(e-s,i+h,s,h),r),n.divided=!0}return n}subdivide(){let t=this.boundary.x,e=this.boundary.y,i=this.boundary.w/2,s=this.boundary.h/2,h=new Rectangle(t+i,e-s,i,s);this.northeast=new QuadTree(h,this.capacity);let r=new Rectangle(t-i,e-s,i,s);this.northwest=new QuadTree(r,this.capacity);let n=new Rectangle(t+i,e+s,i,s);this.southeast=new QuadTree(n,this.capacity);let o=new Rectangle(t-i,e+s,i,s);this.southwest=new QuadTree(o,this.capacity),this.divided=!0}insert(t){return!!this.boundary.contains(t)&&(this.points.length<this.capacity?(this.points.push(t),!0):(this.divided||this.subdivide(),this.northeast.insert(t)||this.northwest.insert(t)||this.southeast.insert(t)||this.southwest.insert(t)))}query(t,e){if(e||(e=[]),!t.intersects(this.boundary))return e;for(let i of this.points)t.contains(i)&&e.push(i);return this.divided&&(this.northwest.query(t,e),this.northeast.query(t,e),this.southwest.query(t,e),this.southeast.query(t,e)),e}closest(t,e,i){if(void 0===t)throw TypeError("Method 'closest' needs a point");if(void 0===e&&(e=1),0==this.length)return[];if(this.length<e)return this.points;if(void 0===i){i=Math.sqrt(Math.pow(this.boundary.w,2)+Math.pow(this.boundary.h,2))+Math.sqrt(Math.pow(t.x,2)+Math.pow(t.y,2))}let s,h=0,r=i,n=8;for(;n>0;){const i=(h+r)/2,o=new Circle(t.x,t.y,i);if((s=this.query(o)).length===e)return s;s.length<e?h=i:(r=i,n--)}return s.sort((e,i)=>{return Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2)-(Math.pow(t.x-i.x,2)+Math.pow(t.y-i.y,2))}),s.slice(0,e)}forEach(t){this.points.forEach(t),this.divided&&(this.northeast.forEach(t),this.northwest.forEach(t),this.southeast.forEach(t),this.southwest.forEach(t))}merge(t,e){let i=Math.min(this.boundary.left,t.boundary.left),s=Math.max(this.boundary.right,t.boundary.right),h=Math.min(this.boundary.top,t.boundary.top),r=Math.max(this.boundary.bottom,t.boundary.bottom)-h,n=s-i,o=new Rectangle(i+n/2,h+r/2,n,r),a=new QuadTree(o,e);return this.forEach(t=>a.insert(t)),t.forEach(t=>a.insert(t)),a}get length(){let t=this.points.length;return this.divided&&(t+=this.northwest.length,t+=this.northeast.length,t+=this.southwest.length,t+=this.southeast.length),t}}"undefined"!=typeof module&&(module.exports={Point:Point,Rectangle:Rectangle,QuadTree:QuadTree,Circle:Circle});
// above is quad tree lib

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
let gunners = [];

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
        if (name.length < 20)
            socket.name = name;
    })

    socket.on('room create', ({ text, maxPlayer } = {}) => {
        if (getRoom(socket))
            return;

        if (maxPlayer < 3 || maxPlayer > 100 || isNaN(maxPlayer)) {
            socket.emit('dialog alert', 'hack cc');
            return;
        }
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

        for (let i = 0; i <= 80; i++) {
            map.push({
                pos: {
                    x: random.float(-WORLDSIZE.width/2, WORLDSIZE.width/2).toFixed(2) - 0,
                    y: random.float(-WORLDSIZE.height/2, WORLDSIZE.height/2).toFixed(2) - 0
                },
                size: random.float(0.5, 1.5).toFixed(3) - 0, //add more size
                degree: 0,
                type: ['Rock', 'Tree'][random.int(0, 1)],
                id: i
            })
        }

        setTimeout(()=>{
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
        socket.join(joinRoomID, ()=>{
            roomIDJoined[socket.id] = joinRoomID;
            setting.playing.push(socket.id);
            io.emit('room update', setting); // update room table

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
                    x: random.int(-WORLDSIZE.width/2, WORLDSIZE.width/2),
                    y: random.int(-WORLDSIZE.height/2, WORLDSIZE.height/2)
                },
                degree: 0,
                status: {
                    hideintree: false
                },
                bullets: [],
                firing: false,
                blood: 100,
                killBy: 'i dont know :/',
                bag: {
                    arr: [{
                            name: 'ak47',
                            bulletCount: 3000,
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
                            bulletCount: 50,
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
                        }
                    ],
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

            workers.push({
                id: gunner.id,
                worker: new Worker(__dirname + '/service.js', {
                    workerData: {
                        gunners,
                        map,
                        myIndex: indexGunner,
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
                        io.to(roomID).emit('gunner dead', {
                            id: gunner.id,
                            killedBy: result.killedBy
                        });
                        io.to(result.killedBy).emit('toast alert', 'You have killed playerID: ' + gunner.id);
                        gunner.killedBy = result.killedBy;
                        gunner.blood = 0;
                        result.bullets.splice(0, result.bullets.length);
                        io.to(roomID).emit('spliceTreeShake', result.treesCollide.normalArr);
                        worker.terminate();
                    }
                }

                //update bag
                let gun = gunner.bag.arr[gunner.bag.index];
                let updateGun = result.bagArr[result.bagArr.findIndex(e => e.name == gun.name)];
                if (gun.isReloading == !updateGun.isReloading) {
                    if (updateGun.isReloading)
                        socket.emit('gun reloading');
                    else
                        socket.emit('gun reloaded', updateGun);
                }
                gunner.bag.arr = result.bagArr;

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
                    io.to(roomID).emit('addTreeShake', result.treesCollide.addArr);
                }

                //tree collide
                if (result.treesCollide.spliceArr.length > 0) {
                    io.to(roomID).emit('spliceTreeShake', result.treesCollide.spliceArr);
                }

                if (result.treesCollide.normalArr.length > 0) { // check if hide in a tree(s)
                    if (!gunner.status.hideintree)
                        io.to(roomID).emit('hideintree', { // invisible = true
                            id: socket.id
                        });
                    gunner.status.hideintree = true;
                } else { // check if not hiding any tree
                    if (gunner.status.hideintree)
                        io.to(roomID).emit('unhideintree', { // invisible = false
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

            // io.to(roomID).emit('new gunner', gunner);
        });
    })

    socket.on('room leave', () => {
        let room = getRoom(socket);
        if (!room) return;
        let { setting, map, gunners } = room;

        io.to(setting.id).emit('room leave', socket.id);

        socket.leave(setting.id, ()=> {
            delete roomIDJoined[socket.id];

            let indexWorker = workers.findIndex(e=>e.id == socket.id); // xóa worker và service
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

        let indexWorker = workers.findIndex(e=>e.id == socket.id);
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