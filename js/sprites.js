import { Config, Collides } from "./utils.js";
const { REAL_SIZE, MINUS_SIZE, ITEM_CONFIG, KEY_CONFIG } = Config;

class Sprite {
    constructor({ id, type, name, pos, defaultRange, getQueryRange, getBoundary, size = 1, degree = 0 } = {}) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.pos = { ...pos };
        this.degree = degree;
        this.size = size;
        this.defaultRange = defaultRange; // range at size: 1

        this.boundary;
        this.getQueryRange = getQueryRange || function() {
            return this.defaultRange * this.size;
        }

        if (getBoundary)
            this.getBoundary = getBoundary;
        this.frameCount = 0;
    }

    update(room) {
        this.frameCount++;
    }

    intersect(otherBoundary) {
        let myBoundary = this.getBoundary();
        let collideFunc1 = Collides[`collide${myBoundary.type}${otherBoundary.type}`];
        let collideFunc2 = Collides[`collide${otherBoundary.type}${myBoundary.type}`];

        if (collideFunc1) {
            return collideFunc1(...myBoundary.data, ...otherBoundary.data);
        } else {
            return collideFunc2(...otherBoundary.data, ...myBoundary.data)
        }
    }
}

class Player extends Sprite {
    constructor(config) {
        super(config);
        this.keyDown = {};
        this.mouseDown = {};
    }

    onKeyDown(key) {
        this.keyDown[key] = true;
    }

    onKeyUp(key) {
        this.keyDown[key] = false;
    }

    onMouseDown(button) {
        this.mouseDown[button] = true;
    }

    onMouseUp(button) {
        this.mouseDown[button] = false;
    }
}

class Human extends Player {
    constructor(config) {
        config.type = "Human";
        super(config);
        let { bag } = config;
        this.bag = bag;
        this.blood = 100;
        this.killerID = "";
        this.holdingCoolDown = 0;
        this.status = {};

        this.directions = ["up", "down", "left", "right"];
    }

    getBoundary() {
        return {
            type: "Circle",
            data: [this.pos.x, this.pos.y, 80 * this.size]
        }
    }

    getMovingSpeed() {
        let speed = 7;
        let holdingGun = this.bag.arr[this.bag.index];
        speed -= holdingGun.weight;

        if (this.mouseDown["left"]) // do somthing with mouse left button
            speed--;

        if (this.keyDown["shift"]) // walking
            speed *= 5 / 10;

        if (speed <= 1)
            speed = 1;

        return speed; //normal
    }

    update(room) {
        super.update(room);
        this.status.hideInTree = false;
        this.status.moving = false;

        let movingVector = {
            x: 0,
            y: 0
        }
        let movingSpeed = this.getMovingSpeed();
        for (let direction of this.directions) { // check all valid direction
            let key = KEY_CONFIG[direction]; // get key in keyboard config
            if (this.keyDown[key]) { // if that key is press-down
                this.status.moving = true;
                switch (direction) {
                    case "up":
                        movingVector.y -= movingSpeed;
                        break;
                    case "down":
                        movingVector.y += movingSpeed;
                        break;
                    case "left":
                        movingVector.x -= movingSpeed;
                        break;
                    case "right":
                        movingVector.x += movingSpeed;
                        break;
                }
            }
        }
        let magMovingVector = Math.sqrt(Math.pow(movingVector.x, 2) + Math.pow(movingVector.y, 2));
        let scale = 1;
        if (magMovingVector > 0)
            scale = movingSpeed / magMovingVector;
        movingVector.x *= scale;
        movingVector.y *= scale;
        this.pos.x += movingVector.x;
        this.pos.y += movingVector.y;
        // end of update position

        let item = this.bag.arr[this.bag.index];
        item.update(room);

        // if ()
    }

    collide(object) {
        switch (object.type) {
            case "Bullet":
                let bulletSpeed = Math.sqrt(Math.pow(object.speed.x, 2) + Math.pow(object.speed.y, 2)) // bullet speed
                let defaultSpeed = 120 // bullet default speed to kill someone
                let defaultRange = 16;
                let damage = 100 * (bulletSpeed / defaultSpeed) * (object.getQueryRange() / defaultRange); // damage chia 2 vi eo hieu sao no bi dinh dan 2 lan :(
                this.blood -= Math.round(damage);
                if (this.blood < 0)
                    this.killerID = object.ownerID;

                object.speed.x *= 0.3; // giam speed dan sau khi tinh dame
                object.speed.y *= 0.3;
                break;
            case "Tree":
                this.status.hideInTree = true;
                break;
            case "Human":
            case "Rock":
                let vectorRockMe = {
                    x: this.pos.x - object.pos.x,
                    y: this.pos.y - object.pos.y
                }
                let mag = Math.sqrt(Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2));
                let newMag = (object.getQueryRange() + this.getQueryRange()) / 2;
                let scaleMag = newMag / mag;
                this.pos.x = vectorRockMe.x * scaleMag + object.pos.x;
                this.pos.y = vectorRockMe.y * scaleMag + object.pos.y
                break;
            case "Score":
                this.blood += object.value;
                this.size = 80 / this.blood;
                if (this.size > 3)
                    this.size = 3;
                if (this.size < 0.5)
                    this.size = 0.5;
                break;
        }
    }
}

class Terrorist extends Human {
    constructor(config) {
        super(config);
        this.img = "terrorist";
    }
}

class CounterTerrorist extends Human {
    constructor(config) {
        super(config);
        this.img = "counter-terrorist";
    }
}

class Bullet extends Sprite {
    constructor(config) {
        config.type = "Bullet";
        super(config);
        let { speed, friction, imgName = "bullet" } = config;
        this.speed = speed;
        this.friction = friction;
        this.imgName = imgName;
    }

    getBoundary() {
        let bRadius = REAL_SIZE[this.imgName] * this.size - MINUS_SIZE[this.imgName];
        let px = this.pos.x - this.speed.x; // previous position
        let py = this.pos.y - this.speed.y;
        let cx = this.pos.x; // current position
        let cy = this.pos.y;

        let vectorO1O2 = this.speed; // vector chỉ phương tương đương với vector tốc độ đạn
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

        return {
            type: "Poly",
            data: [
                [A, B, C, D]
            ]
        }
    }

    collide(object) {
        switch (object.type) {
            case "Human":
                // ben human co xu li roi
                break;
            case "Bullet":
                {
                    let newSpeed = {
                        x: (this.speed.x + object.speed.x) / 2,
                        y: (this.speed.y + object.speed.y) / 2
                    }
                    this.speed.x = newSpeed.x;
                    this.speed.y = newSpeed.y;
                    break;
                }
            case "Tree":
                this.speed.x *= 0.8;
                this.speed.y *= 0.8
                break;
            case "Rock":
                {
                    let vectorRockMe = {
                        x: this.pos.x - object.pos.x,
                        y: this.pos.y - object.pos.y
                    }
                    let magNewVector = Math.sqrt(Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2));
                    let bulletSpeed = Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2));
                    let scale = bulletSpeed / magNewVector;
                    let bounceFriction = .7;
                    this.speed.x = vectorRockMe.x * scale * bounceFriction;
                    this.speed.y = vectorRockMe.y * scale * bounceFriction;
                    break;
                }
            case "Score":
                {
                    let vectorScoreMe = {
                        x: this.pos.x - object.pos.x,
                        y: this.pos.y - object.pos.y
                    }
                    let magNewVector = Math.sqrt(Math.pow(vectorScoreMe.x, 2) + Math.pow(vectorScoreMe.y, 2));
                    let bulletSpeed = Math.sqrt(Math.pow(this.pos.x, 2) + Math.pow(this.pos.y, 2));
                    let scale = bulletSpeed / magNewVector;
                    let bounceFriction = .6;
                    this.speed.x = vectorScoreMe.x * scale * bounceFriction;
                    this.speed.y = vectorScoreMe.y * scale * bounceFriction;
                    break;
                }
        }
    }

    update(room) {
        super.update(room);
        if (this.delete)
            return;
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;
        this.speed.x *= this.friction;
        this.speed.y *= this.friction;
    }
}

module.exports = {
    Sprite,
    Bullet,
    Human,
    Terrorist
}