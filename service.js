class Point{constructor(t,e,i){this.x=t,this.y=e,this.userData=i}}class Rectangle{constructor(t,e,i,s){this.x=t,this.y=e,this.w=i,this.h=s}get left(){return this.x-this.w/2}get right(){return this.x+this.w/2}get top(){return this.y-this.h/2}get bottom(){return this.y+this.h/2}contains(t){return t.x>=this.x-this.w&&t.x<=this.x+this.w&&t.y>=this.y-this.h&&t.y<=this.y+this.h}intersects(t){return!(t.x-t.w>this.x+this.w||t.x+t.w<this.x-this.w||t.y-t.h>this.y+this.h||t.y+t.h<this.y-this.h)}}class Circle{constructor(t,e,i){this.x=t,this.y=e,this.r=i,this.rSquared=this.r*this.r}contains(t){return Math.pow(t.x-this.x,2)+Math.pow(t.y-this.y,2)<=this.rSquared}intersects(t){let e=Math.abs(t.x-this.x),i=Math.abs(t.y-this.y),s=this.r,h=t.w,r=t.h,n=Math.pow(e-h,2)+Math.pow(i-r,2);return!(e>s+h||i>s+r)&&(e<=h||i<=r||n<=this.rSquared)}}class QuadTree{constructor(t,e){if(!t)throw TypeError("boundary is null or undefined");if(!(t instanceof Rectangle))throw TypeError("boundary should be a Rectangle");if("number"!=typeof e)throw TypeError(`capacity should be a number but is a ${typeof e}`);if(e<1)throw RangeError("capacity must be greater than 0");this.boundary=t,this.capacity=e,this.points=[],this.divided=!1}static create(){if(0===arguments.length){if("undefined"==typeof width)throw new TypeError("No global width defined");if("undefined"==typeof height)throw new TypeError("No global height defined");let t=new Rectangle(width/2,height/2,width,height);return new QuadTree(t,8)}if(arguments[0]instanceof Rectangle){let t=arguments[1]||8;return new QuadTree(arguments[0],t)}if("number"==typeof arguments[0]&&"number"==typeof arguments[1]&&"number"==typeof arguments[2]&&"number"==typeof arguments[3]){let t=arguments[4]||8;return new QuadTree(new Rectangle(arguments[0],arguments[1],arguments[2],arguments[3]),t)}throw new TypeError("Invalid parameters")}toJSON(t){let e={points:this.points};return this.divided&&(this.northeast.points.length>0&&(e.ne=this.northeast.toJSON(!0)),this.northwest.points.length>0&&(e.nw=this.northwest.toJSON(!0)),this.southeast.points.length>0&&(e.se=this.southeast.toJSON(!0)),this.southwest.points.length>0&&(e.sw=this.southwest.toJSON(!0))),t||(e.capacity=this.capacity,e.x=this.boundary.x,e.y=this.boundary.y,e.w=this.boundary.w,e.h=this.boundary.h),e}static fromJSON(t,e,i,s,h,r){if(void 0===e){if(!("x"in t))throw TypeError("JSON missing boundary information");e=t.x,i=t.y,s=t.w,h=t.h,r=t.capacity}let n=new QuadTree(new Rectangle(e,i,s,h),r);if(n.points=t.points,"ne"in t||"nw"in t||"se"in t||"sw"in t){let e=n.boundary.x,i=n.boundary.y,s=n.boundary.w/2,h=n.boundary.h/2;n.northeast="ne"in t?QuadTree.fromJSON(t.ne,e+s,i-h,s,h,r):new QuadTree(new Rectangle(e+s,i-h,s,h),r),n.northwest="nw"in t?QuadTree.fromJSON(t.nw,e-s,i-h,s,h,r):new QuadTree(new Rectangle(e-s,i-h,s,h),r),n.southeast="se"in t?QuadTree.fromJSON(t.se,e+s,i+h,s,h,r):new QuadTree(new Rectangle(e+s,i+h,s,h),r),n.southwest="sw"in t?QuadTree.fromJSON(t.sw,e-s,i+h,s,h,r):new QuadTree(new Rectangle(e-s,i+h,s,h),r),n.divided=!0}return n}subdivide(){let t=this.boundary.x,e=this.boundary.y,i=this.boundary.w/2,s=this.boundary.h/2,h=new Rectangle(t+i,e-s,i,s);this.northeast=new QuadTree(h,this.capacity);let r=new Rectangle(t-i,e-s,i,s);this.northwest=new QuadTree(r,this.capacity);let n=new Rectangle(t+i,e+s,i,s);this.southeast=new QuadTree(n,this.capacity);let o=new Rectangle(t-i,e+s,i,s);this.southwest=new QuadTree(o,this.capacity),this.divided=!0}insert(t){return!!this.boundary.contains(t)&&(this.points.length<this.capacity?(this.points.push(t),!0):(this.divided||this.subdivide(),this.northeast.insert(t)||this.northwest.insert(t)||this.southeast.insert(t)||this.southwest.insert(t)))}query(t,e){if(e||(e=[]),!t.intersects(this.boundary))return e;for(let i of this.points)t.contains(i)&&e.push(i);return this.divided&&(this.northwest.query(t,e),this.northeast.query(t,e),this.southwest.query(t,e),this.southeast.query(t,e)),e}closest(t,e,i){if(void 0===t)throw TypeError("Method 'closest' needs a point");if(void 0===e&&(e=1),0==this.length)return[];if(this.length<e)return this.points;if(void 0===i){i=Math.sqrt(Math.pow(this.boundary.w,2)+Math.pow(this.boundary.h,2))+Math.sqrt(Math.pow(t.x,2)+Math.pow(t.y,2))}let s,h=0,r=i,n=8;for(;n>0;){const i=(h+r)/2,o=new Circle(t.x,t.y,i);if((s=this.query(o)).length===e)return s;s.length<e?h=i:(r=i,n--)}return s.sort((e,i)=>{return Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2)-(Math.pow(t.x-i.x,2)+Math.pow(t.y-i.y,2))}),s.slice(0,e)}forEach(t){this.points.forEach(t),this.divided&&(this.northeast.forEach(t),this.northwest.forEach(t),this.southeast.forEach(t),this.southwest.forEach(t))}merge(t,e){let i=Math.min(this.boundary.left,t.boundary.left),s=Math.max(this.boundary.right,t.boundary.right),h=Math.min(this.boundary.top,t.boundary.top),r=Math.max(this.boundary.bottom,t.boundary.bottom)-h,n=s-i,o=new Rectangle(i+n/2,h+r/2,n,r),a=new QuadTree(o,e);return this.forEach(t=>a.insert(t)),t.forEach(t=>a.insert(t)),a}get length(){let t=this.points.length;return this.divided&&(t+=this.northwest.length,t+=this.northeast.length,t+=this.southwest.length,t+=this.southeast.length),t}}"undefined"!=typeof module&&(module.exports={Point:Point,Rectangle:Rectangle,QuadTree:QuadTree,Circle:Circle});
// above is quad tree lib
function DegreesToRadians(degrees) {
    const pi = Math.PI;
    return degrees * (pi / 180);
}

function RadiansToDegrees(radians) {
    const pi = Math.PI;
    return radians * (180 / pi);
}
const {
    workerData,
    parentPort
} = require('worker_threads');
const collide = require(`${__dirname}/assets/lib/p5.collide.js`);
const randomNormal = require('random-normal');
const random = require('random');
const MOVING_SPEED = function(object) { // object here means gunner me 
    let speed = 7;

    if (object.keydown['shift'])
        speed = 3;

    if (object.firing)
        speed--;
    speed -= BULLET_CONFIG[object.bag.arr[object.bag.index].name].weight;
    if (speed <= 0)
        speed = 1;
    return speed; //normal
};
const BULLET_CONFIG = {
    ak47: {
        imgName: 'Bullet',
        size: 0.89,
        split: 1,
        delayHold: 20,
        delayFire: 4,
        speed: 75,
        friction: 0.93,
        dev: {
            moving: 35,
            walking: 20,
            staying: 10
        },
        round: 30,
        reload: 45,
        weight: 1
    },
    awp: {
        imgName: 'Bullet',
        size: 1,
        split: 1,
        delayHold: 50,
        delayFire: 50,
        speed: 120,
        friction: 0.93,
        dev: {
            moving: 30,
            walking: 10,
            staying: 1
        },
        round: 5,
        reload: 110,
        weight: 3.7
    },
    m4a1: {
        imgName: 'Bullet',
        size: 0.85,
        split: 1,
        delayHold: 20,
        delayFire: 4,
        speed: 70,
        friction: 0.93,
        dev: {
            moving: 30,
            walking: 15,
            staying: 7
        },
        round: 30,
        reload: 50,
        weight: 1.2
    },
    paint: {
        imgName: 'Paint-bullet',
        size: 1.7,
        split: 1,
        delayHold: 20,
        delayFire: 10,
        speed: 80,
        friction: 0.88,
        dev: {
            moving: 30,
            walking: 20,
            staying: 15
        },
        round: 10,
        reload: 60,
        weight: 2
    },
    shotgun: {
        imgName: 'Bullet',
        size: 0.3,
        split: 6,
        delayHold: 20,
        delayFire: 20,
        speed: 120,
        friction: 0.85,
        dev: {
            moving: 25,
            walking: 20,
            staying: 15
        },
        round: 5,
        reload: 70,
        weight: 2.8
    },
    chicken: {
        imgName: 'Egg',
        size: 1,
        split: 1,
        delayHold: 30,
        delayFire: 7,
        speed: 120,
        friction: 0.8,
        dev: {
            moving: 30,
            walking: 25,
            staying: 20
        },
        round: 100,
        reload: 10,
        weight: 1.5
    },
    gatlin: {
        imgName: 'Bullet',
        size: 0.8,
        split: 1,
        delayHold: 100,
        delayFire: 3,
        speed: 100,
        friction: 0.91,
        dev: {
            moving: 50,
            walking: 40,
            staying: 30
        },
        round: 200,
        reload: 200,
        weight: 4.5
    },
    rpk: {
        imgName: 'Bullet',
        size: 0.85,
        split: 1,
        delayHold: 30,
        delayFire: 4,
        speed: 120,
        friction: 0.92,
        dev: {
            moving: 40,
            walking: 34,
            staying: 27
        },
        round: 80,
        reload: 40,
        weight: 2.3
    },
    uzi: {
        imgName: 'Smg-bullet',
        size: 0.6,
        split: 1,
        delayHold: 20,
        delayFire: 2,
        speed: 80,
        friction: 0.89,
        dev: {
            moving: 25,
            walking: 20,
            staying: 10
        },
        round: 25,
        reload: 30,
        weight: 0.5
    },
    revolver: {
    	imgName: 'Bullet',
    	size: 0.9,
    	split: 1,
    	delayHold: 30,
    	delayFire: 17,
    	speed: 130,
    	friction: 0.87,
    	dev: {
    	    moving: 20,
    	    walking: 15,
    	    staying: 10
    	},
    	round: 8,
    	reload: 40,
    	weight: 0.3
    }
}

const REAL_SIZE = {
    Rock: 200, // những vật tròn thì là trừ
    Tree: 190, // ví dụ: object.size*200 - 120
    Bullet: 10,
    Egg: 22,
    'Paint-bullet': 22,
    'Smg-bullet': 10,
    Gunner: 80,
    Box_emty: {
        width: 144,
        height: 143
    },
    Box_wooden: {
        width: 144,
        height: 143
    },
    Roof_brown: {
        width: 833,
        height: 434
    }
}

const MINUS_SIZE = {
    Rock: 30,
    Tree: 120,
    Bullet: 2,
    Egg: 2,
    'Paint-bullet': 2,
    'Smg-bullet': 2,
    Gunner: 10,
    Box_emty: {
        width: 10,
        height: 10
    },
    Box_wooden: {
        width: 10,
        height: 10
    },
    Roof_brown: {
        width: 20,
        height: 20
    }
}

let {
    gunners,
    map,
    myIndex,
    worldSize
} = workerData;
let gunner = gunners[myIndex];
let {
    move
} = gunner;
let bullets = [];
let position = gunner.pos;
let bulletID = 0;
let frameCount = 0;
let points;
let blood = 100;
let killedBy = "i dont know :/";
let firstBullet = false;

let treesCollide = [];
let lastTreesCollide = []; // lastTreesCollide is last treesCollide
let lastWeaponHolding = "";
let myJob;

parentPort.on('message', (result) => { // refresh move
    switch (result.name) {
        case 'request':
            // { gunners, map, myIndex } = result;
            gunners = result.gunners;
            map = result.map;
            myIndex = result.myIndex;
            if (myIndex == -1) {
                clearInterval(myJob);
                return;
            }

            gunner = gunners[myIndex];
            blood = gunner.blood;
            // console.log(gunner.blood)
            move = gunner.move;
            bullets = gunner.bullets;
            break;
    }
});

function checkCollide(circlePos, radius, object) { // object = map[i]
    let real = REAL_SIZE[object.type];
    let minus = MINUS_SIZE[object.type];
    switch (object.type) {
        case 'Bullet':
            let bRadius = REAL_SIZE[BULLET_CONFIG[object.name].imgName] * BULLET_CONFIG[object.name].size - MINUS_SIZE[BULLET_CONFIG[object.name].imgName];
            let px = object.pos.x - object.speed.x; // previous position
            let py = object.pos.y - object.speed.y;
            let cx = object.pos.x; // current position
            let cy = object.pos.y;

            let vectorO1O2 = object.speed; // vector chỉ phương tương đương với vector tốc độ đạn
            let vectorAB = { // vector pháp tuyến
                x: -vectorO1O2.y,
                y: vectorO1O2.x
            }
            let magAB = Math.sqrt(Math.pow(vectorAB.x, 2) + Math.pow(vectorAB.y, 2)); // length của vector pháp tuyến
            let scale = (bRadius / 2) / magAB; // scale để length của vector pháp tuyến = x length
            let A = {
                    x: vectorAB.x * scale + px,
                    y: vectorAB.y * scale + py
                },
                B = {
                    x: -vectorAB.x * scale + px,
                    y: -vectorAB.x * scale + py
                },
                C = {
                    x: -vectorAB.x * scale + cx,
                    y: -vectorAB.x * scale + cy
                },
                D = {
                    x: vectorAB.x * scale + cx,
                    y: vectorAB.y * scale + cy
                }
            let poly = [A, B, C, D];

            return collide.collideCirclePoly(circlePos.x, circlePos.y, radius, poly); //real * object.size - minus
            break;
        case 'Tree':
        case 'Rock':
        case 'Gunner':
            return collide.collideCircleCircle(circlePos.x, circlePos.y, radius, object.pos.x, object.pos.y, real * object.size - minus);
            break;
        case 'Box_emty':
        case 'Box_wooden':
        case 'Roof_brown':
            let newWidth = real.width * object.size - minus.width / 2;
            let newHeight = real.height * object.size - minus.height / 2;
            return collide.collideRectCircle(object.pos.x - newWidth / 2, object.pos.y - newHeight / 2, newWidth, newHeight, circlePos.x, circlePos.y, radius);
            break;
    }
}

let boundary = new Rectangle(0, 0, 9000, 9000);

myJob = setInterval(() => {
    let ping = Date.now();
    if (myIndex == -1) {
        return;
    }

    frameCount++;
    holdingCoolDownIsChanged = false;

    let qtree = new QuadTree(boundary, 4);

    for (let object of map) {
        switch (object.type) {
            case 'Bullet': // {type: "Bullet", arr: [some bullets]}
                for (let bullet of object.arr) {
                    let point = new Point(bullet.pos.x, bullet.pos.y, bullet);
                    qtree.insert(point);
                }
                break;
            default: // normal map
                let point = new Point(object.pos.x, object.pos.y, object);
                qtree.insert(point);
        }
    }

    for (let otherGunner of gunners) {
        if (otherGunner.id != gunner.id) {
            let point = new Point(otherGunner.pos.x, otherGunner.pos.y, otherGunner);
            qtree.insert(point);
        }
    }

    treesCollide.length = 0;
    let checkMoving = false;

    if (move.up && move.down) {
        move.up = false;
        move.down = false;
    }

    if (move.left && move.right) {
        move.left = false;
        move.right = false;
    }

    let lastPosition = { ...position }; // cái này để check cái va chạm ô vuông phía dưới

    for (let i in move) {
        if (move[i]) {
            checkMoving = true;
            switch (i) {
                case 'up':
                    if (position.y > -worldSize.height / 2 - 200)
                        position.y -= MOVING_SPEED(gunner);
                    break;
                case 'down':
                    if (position.y < worldSize.height / 2 + 200)
                        position.y += MOVING_SPEED(gunner);
                    break;
                case 'left':
                    if (position.x > -worldSize.width / 2 - 199)
                        position.x -= MOVING_SPEED(gunner);
                    break;
                case 'right':
                    if (position.x < worldSize.width / 2 + 200)
                        position.x += MOVING_SPEED(gunner);
                    break;
            }
        }
    }

    let deleteBullets = [];

    // kiểm tra các vật trong tầm va chạm giữa mình và các vật
    let range = new Circle(position.x, position.y, 200);
    points = qtree.query(range);

    for (let point of points) {
        let other = point.userData;
        if (checkCollide(position, 80, other)) {
            switch (other.type) { // làm những việc sau khi bị va chạm
                case 'Gunner':
                case 'Rock':
                    let xanh = {
                        x: position.x,
                        y: position.y,
                    };
                    let tam = {
                        x: other.pos.x,
                        y: other.pos.y,
                    };
                    let distance_xanh_tam = Math.sqrt(Math.pow(xanh.x - tam.x, 2) + Math.pow(xanh.y - tam.y, 2));
                    if (distance_xanh_tam == 0) {
                        distance_xanh_tam = 1;
                        xanh.x += Math.random();
                        xanh.y += Math.random();
                    }
                    let red;
                    let radius = (80 + (REAL_SIZE[other.type] * other.size - MINUS_SIZE[other.type])) / 2;

                    red = {
                        x: (radius * (xanh.x - tam.x)) / distance_xanh_tam + tam.x,
                        y: (radius * (xanh.y - tam.y)) / distance_xanh_tam + tam.y,
                    };

                    position = {
                        ...red
                    };

                    break;
                case 'Tree':
                    if (treesCollide.indexOf(other.id) == -1) {
                        treesCollide.push(other.id);
                    }
                    break;
                case 'Bullet':
                    if (other.owner == gunner.id) {
                        break;
                    }
                    let bSpeed = Math.sqrt(Math.pow(other.speed.x, 2) + Math.pow(other.speed.y, 2)) // bullet speed
                    let bDSpeed = 120 // bullet default speed
                    let damage = 100 / 2 * (bSpeed / bDSpeed) * other.size; // damage chia 2 vi eo hieu sao no bi dinh dan 2 lan :(
                    blood -= Math.round(damage);
                    if (blood <= 0) {
                        killedBy = other.owner;
                    }
                    deleteBullets.push(other);
                    break;
                case 'Box_emty':
                case 'Box_wooden':
                case 'Roof_brown':
                    let sizeBox = {
                        width: REAL_SIZE[other.type].width * other.size - MINUS_SIZE[other.type].width / 2,
                        height: REAL_SIZE[other.type].height * other.size - MINUS_SIZE[other.type].height / 2
                    }
                    let leftSide = other.pos.x - sizeBox.width / 2,
                        rightSide = other.pos.x + sizeBox.width / 2,
                        topSide = other.pos.y - sizeBox.height / 2,
                        bottomSide = other.pos.y + sizeBox.height / 2;

                    let sides = [];
                    let testX = position.x;
                    let testY = position.y;

                    // which edge is closest?
                    if (position.x < leftSide) {
                        testX = leftSide; // test left edge
                        sides.push('left');
                    } else if (position.x > rightSide) {
                        testX = rightSide; // right edge
                        sides.push('right');
                    }
                    if (position.y < topSide) {
                        testY = topSide; // top edge
                        sides.push('top');
                    } else if (position.y > bottomSide) {
                        testY = bottomSide; // bottom edge
                        sides.push('bottom');
                    }
                    let fitW = 40 + MINUS_SIZE[other.type].width / 2;
                    let fitH = 40 + MINUS_SIZE[other.type].height / 2;
                    if (sides.length > 1) {
                        fitW -= MINUS_SIZE[other.type].width / 2;
                        fitH -= MINUS_SIZE[other.type].height / 2;
                    }
                    for (let side of sides) {
                        switch (side) {
                            case "left":
                                position.x = leftSide - fitW;
                                break;
                            case "right":
                                position.x = rightSide + fitW;
                                break;
                            case "top":
                                position.y = topSide - fitH;
                                break;
                            case "bottom":
                                position.y = bottomSide + fitH;
                                break;
                        }
                    }
                    // if (sides.length == 1) { // nếu va chạm 1 cạnh
                    // 	let fitW = 40 + MINUS_SIZE[other.name].width/2*1.1;
                    // 	let fitH = 40 + MINUS_SIZE[other.name].height/2*1.1;
                    //     switch (sides[0]) {
                    //         case "left":
                    //             position.x = leftSide - fitW;
                    //             break;
                    //         case "right":
                    //             position.x = rightSide + fitW;
                    //             break;
                    //         case "top":
                    //             position.y = topSide - fitH;
                    //             break;
                    //         case "bottom":
                    //             position.y = bottomSide + fitH;
                    //             break;
                    //     }
                    // } else { // nếu va chạm ở góc
                    // position.x = lastPosition.x; // láy vị trí trước đó
                    // position.y = lastPosition.y;
                    // let save = {
                    // 	x: position.x,
                    // 	y: position.y
                    // }
                    // for (let i in move) {
                    //     switch (i) {
                    //         case 'up':
                    //             position.y -= MOVING_SPEED(gunner);
                    //             break;
                    //         case 'down':
                    //             position.y += MOVING_SPEED(gunner);
                    //             break;
                    //         case 'left':
                    //             position.x -= MOVING_SPEED(gunner);
                    //             break;
                    //         case 'right':
                    //             position.x += MOVING_SPEED(gunner);
                    //             break;
                    //     }
                    //     if (checkCollide(position, 80, other)) { // sau khi đi nếu va chạm thì reverse
                    //         position.x = save.x;
                    //         position.y = save.y;
                    //     }
                    //     save.x = position.x;
                    //     save.y = position.y;
                    // }
                    // }
                    break;
            }
        }
    }


    // Bullet things
    for (let index = 0; index < bullets.length; index++) {
        let bullet = bullets[index];

        if (bullet.delete) { // died
            bullets.splice(index, 1);
            index--;
        } else { // alive
            bullet.pos.x += bullet.speed.x;
            bullet.pos.y += bullet.speed.y;
            bullet.speed.x *= bullet.friction;
            bullet.speed.y *= bullet.friction;
            if (Math.sqrt(Math.pow(bullet.speed.x, 2) + Math.pow(bullet.speed.y, 2)) <= 0.1) {
                bullet.delete = true;
            }
            //kiểm tra các vật va chạm giữa các viên đạn và các vật khác
            let range = new Circle(bullet.pos.x, bullet.pos.y, 16 + 200);
            points = qtree.query(range);

            for (let point of points) { // lần kiểm tra này là kiểm tra va chạm những vật chặn
                let other = point.userData;
                let bRadius = REAL_SIZE[BULLET_CONFIG[bullet.name].imgName] * BULLET_CONFIG[bullet.name].size - MINUS_SIZE[BULLET_CONFIG[bullet.name].imgName];
                if (checkCollide(bullet.pos, bRadius, other)) {
                    switch (other.type) {
                        case 'Rock':
                            // bullet.speed.x *= 0.5;
                            // bullet.speed.y *= 0.5;
                            let bounceVector = {
                                x: (bullet.pos.x - bullet.speed.x) - other.pos.x,
                                y: (bullet.pos.y - bullet.speed.y) - other.pos.y
                            }
                            let magBounce = Math.sqrt(Math.pow(bounceVector.x, 2) + Math.pow(bounceVector.y, 2));
                            let magSpeed = Math.sqrt(Math.pow(bullet.speed.x, 2) + Math.pow(bullet.speed.y, 2));
                            let scale = magSpeed / magBounce;
                            let newSpeed = {
                                x: (bounceVector.x * scale) / 2,
                                y: (bounceVector.y * scale) / 2
                            }
                            bullet.speed.x = newSpeed.x;
                            bullet.speed.y = newSpeed.y;

                            break;
                        case 'Tree':
                            bullet.speed.x *= 0.85;
                            bullet.speed.y *= 0.85;
                            break;
                        case 'Box_emty':
                        case 'Box_wooden':
                        case 'Roof_brown':
                            let sizeBox = {
                                width: REAL_SIZE[other.type].width * other.size - MINUS_SIZE[other.type].width / 2,
                                height: REAL_SIZE[other.type].height * other.size - MINUS_SIZE[other.type].height / 2
                            }
                            let leftSide = other.pos.x - sizeBox.width / 2,
                                rightSide = other.pos.x + sizeBox.width / 2,
                                topSide = other.pos.y - sizeBox.height / 2,
                                bottomSide = other.pos.y + sizeBox.height / 2;

                            let sides = [];
                            let cx = bullet.pos.x - bullet.speed.x;
                            let cy = bullet.pos.y - bullet.speed.y;
                            let testX = cx;
                            let testY = cy;

                            // which edge is closest?
                            if (cx < leftSide) {
                                testX = leftSide; // test left edge
                                sides.push('left');
                            } else if (cx > rightSide) {
                                testX = rightSide; // right edge
                                sides.push('right');
                            }
                            if (cy < topSide) {
                                testY = topSide; // top edge
                                sides.push('top');
                            } else if (cy > bottomSide) {
                                testY = bottomSide; // bottom edge
                                sides.push('bottom');
                            }
                            let distance = Math.sqrt(Math.pow(cx - testX, 2) + Math.pow(cy - testY, 2));
                            let bulletVector = { ...bullet.speed };
                            if (sides.length > 0) {
                                let scaleBV;
                                let bounceFric = 0.7;
                                switch (sides[random.int(0, sides.length - 1)]) {
                                    case "left":
                                        bullet.speed.x *= -bounceFric;
                                        scaleBV = distance / bulletVector.x;
                                        break;
                                    case "right":
                                        bullet.speed.x *= -bounceFric;
                                        scaleBV = distance / bulletVector.x;
                                        break;
                                    case "top":
                                        bullet.speed.y *= -bounceFric;
                                        scaleBV = distance / bulletVector.y;
                                        break;
                                    case "bottom":
                                        bullet.speed.y *= -bounceFric;
                                        scaleBV = distance / bulletVector.y;
                                        break;
                                }
                                bullet.pos.x = cx + bulletVector.x * Math.abs(scaleBV);
                                bullet.pos.y = cy + bulletVector.y * Math.abs(scaleBV);
                            } else {
                                bullet.delete = true;
                            }

                            break;
                    }
                }
            }
            //kiểm tra xong va chạm đạn
        }
    }
    let bag = gunner.bag;
    let holdingGun = bag.arr[bag.index];
    if (holdingGun.name != lastWeaponHolding) { // khi đổi vũ khí
        let lastIndexGun = bag.arr.findIndex(e => e.name == lastWeaponHolding);
        if (lastIndexGun != -1)
            bag.arr[lastIndexGun].isReloading = false;
        gunner.holdingCoolDown = BULLET_CONFIG[holdingGun.name].delayHold;
    }

    if (gunner.holdingCoolDown > 0)
        gunner.holdingCoolDown--;
    else { // khi cooldown đếm xong
        if (holdingGun.isReloading) {
            holdingGun.isReloading = false;
            holdingGun.bulletCount = BULLET_CONFIG[holdingGun.name].round;
            holdingGun.magazine--;
        } else {
            if (!holdingGun.isReloading && holdingGun.magazine > 0 && ((!gunner.firing && holdingGun.bulletCount <= 0) || gunner.keydown['r'])) { // nếu đang ở trang thái không bắn và hết đạn thì reload đạn
                holdingGun.isReloading = true;
                gunner.holdingCoolDown = BULLET_CONFIG[holdingGun.name].reload;
            }

            if (gunner.firing && holdingGun.bulletCount > 0 && !holdingGun.isReloading) { // cooldown đếm xong và đang ở trạng thái bắn với số đạn > 0
                gunner.holdingCoolDown = BULLET_CONFIG[holdingGun.name].delayFire;
                holdingCoolDownIsChanged = true;
                holdingGun.bulletCount--;
                let status = 'staying';
                if (checkMoving) {
                    status = 'moving';
                    if (gunner.keydown['shift'])
                        status = 'walking';
                }

                for (let i = 0; i < BULLET_CONFIG[holdingGun.name].split; i++) {
                    let noise = randomNormal({
                        mean: 0,
                        dev: Math.PI / 180 * (BULLET_CONFIG[holdingGun.name].dev[status] / 4)
                    });

                    let radian = DegreesToRadians(gunner.degree);
                    let dx = Math.cos(radian); // default speed x, y for get starPos of bullet
                    let dy = Math.sin(radian);
                    let magDefault = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    let scaleDefault = 70 / magDefault;
                    let startPos = { // vị trí bắn ở đầu nhân vật
                        x: position.x + dx * scaleDefault,
                        y: position.y + dy * scaleDefault,
                    };

                    let radianSpeed = radian + noise;
                    let sx = Math.cos(radianSpeed); // nx means noised position x
                    let sy = Math.sin(radianSpeed);
                    let magSpeed = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
                    let scaleSpeed = BULLET_CONFIG[holdingGun.name].speed / magSpeed; // scale cho cái speed = bulletconfig>speed
                    let speed = { // vector speed đạn 
                        x: sx * scaleSpeed,
                        y: sy * scaleSpeed
                    };

                    let friction = BULLET_CONFIG[holdingGun.name].friction;

                    bullets.push({
                        owner: gunner.id,
                        name: holdingGun.name,
                        id: `${gunner.id}|${bulletID++}${((i > 0) ? '(split)': '')}`,
                        type: 'Bullet',
                        speed,
                        size: BULLET_CONFIG[holdingGun.name].size,
                        friction,
                        degree: RadiansToDegrees(radianSpeed),
                        pos: startPos,
                        delete: false,
                        imgName: BULLET_CONFIG[holdingGun.name].imgName.toLowerCase()
                    });
                }
            }
        }
    }



    let addArr = [];
    let spliceArr = [];
    let normalArr = [...treesCollide];

    if (!checkMoving) { // khi đứng yên
        treesCollide.length = 0;
    }

    for (let i in treesCollide) { // list of new tree collide
        if (lastTreesCollide.indexOf(treesCollide[i]) == -1) {
            addArr.push(treesCollide[i]);
        }
    }

    for (let i in lastTreesCollide) { // list of old tree collide
        if (treesCollide.indexOf(lastTreesCollide[i]) == -1) {
            spliceArr.push(lastTreesCollide[i]);
        }
    }
    lastTreesCollide = [...treesCollide];
    lastWeaponHolding = holdingGun.name;

    parentPort.postMessage({
        name: 'response',
        position,
        bullets,
        blood,
        killedBy,
        deleteBullets,
        holdingCoolDown: gunner.holdingCoolDown,
        bagArr: gunner.bag.arr,
        treesCollide: {
            addArr,
            spliceArr,
            normalArr,
        },
    });

    // console.log(Date.now() - ping);
}, 30);