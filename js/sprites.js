import { Config, Collides } from "./utils.js";
const { REAL_SIZE, MINUS_SIZE, ITEM_CONFIG, KEY_CONFIG } = Config;
const random = require("random");

class Sprite {
    // getQueryRange ko can truyen cung duoc
    constructor({ id, type, name, pos, defaultRange, getQueryRange, getBoundary, speed = { x: 0, y: 0 }, size = 1, degree = 0 } = {}) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.pos = { ...pos };
        this.speed = { ...speed }
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

    getBoundary() {
        return {
            type: "Circle",
            data: [this.pos.x, this.pos.y, this.getQueryRange()]
        }
    }

    update(room) {
        this.frameCount++;
    }

    intersect(otherBoundary) {
        let myBoundary = this.getBoundary();
        return Collides.collideAll(myBoundary, otherBoundary);
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
        let { bag, defaultRange } = config;
        this.bag = bag;
        this.blood = 100;
        this.killerID = "";
        this.holdingCoolDown = 0;
        this.status = {};

        this.directions = ["up", "down", "left", "right"];
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

        return speed / this.size; //normal
    }

    update(room) {
        super.update(room);
        this.size = this.blood / 100;
        if (this.size > 2)
            this.size = 2;
        if (this.size < 0.5)
            this.size = 0.5;
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
        switch (object.origin.type) {
            case "Bullet":
                if (this.id != object.origin.ownerID) {
                    let bulletSpeed = Math.sqrt(Math.pow(object.copy.speed.x, 2) + Math.pow(object.copy.speed.y, 2)) // bullet speed
                    let defaultSpeed = 200 // bullet default speed to kill someone, reach this, will make 100 damage
                    let defaultRange = 16;
                    let damage = 100 * (bulletSpeed / defaultSpeed) * (object.origin.getQueryRange() / 20); // damage chia 2 vi eo hieu sao no bi dinh dan 2 lan :(
                    this.blood -= Math.round(damage);
                    if (this.blood < 0)
                        this.killerID = object.origin.ownerID;
                }
                break;
            case "Tree":
                this.status.hideInTree = true;
                break;
            case "Human":
            case "Rock":
                let vectorRockMe = {
                    x: this.pos.x - object.origin.pos.x,
                    y: this.pos.y - object.origin.pos.y
                }
                let mag = Math.sqrt(Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2));
                let newMag = (object.origin.getQueryRange() + this.getQueryRange()) / 2;
                let scaleMag = newMag / mag;
                this.pos.x = vectorRockMe.x * scaleMag + object.origin.pos.x;
                this.pos.y = vectorRockMe.y * scaleMag + object.origin.pos.y
                break;
            case "Score":
                this.blood += object.copy.value;
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
        let { ownerID, speed, friction, imgName = "bullet" } = config;
        this.ownerID = ownerID;
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
        switch (object.origin.type) {
            case "Human":
                if (object.origin.id != this.ownerID) { // neu nguoi do ko phai la minh
                    this.speed.x *= 0.4; // giam speed dan sau khi tinh dame
                    this.speed.y *= 0.4;
                }
                break;
            case "Bullet":
            case "Score":
                {
                    let newSpeed = {
                        x: object.copy.speed.x / 100 * 80,
                        y: object.copy.speed.y / 100 * 80
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
                        x: this.pos.x - object.origin.pos.x,
                        y: this.pos.y - object.origin.pos.y
                    }
                    let magNewVector = Math.sqrt(Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2));
                    let bulletSpeed = Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2));
                    let scale = bulletSpeed / magNewVector;
                    let bounceFriction = .7;
                    this.speed.x = vectorRockMe.x * scale * bounceFriction;
                    this.speed.y = vectorRockMe.y * scale * bounceFriction;
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

        if (Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2)) <= 0.2) {
            this.delete = true;
        }
    }
}

class Score extends Sprite {
    constructor(config) {
        super(config);
        let { value } = config;
        this.value = value;
        this.type = "Score";
        this.size = this.value / 10;
    }

    update() {
        this.size = this.value / 10;
        let speed = 2;
        this.speed.x += random.float(-speed, speed);
        this.speed.y += random.float(-speed, speed);
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;
        this.speed.x *= 0.9;
        this.speed.y *= 0.9;
    }

    collide(object) {
        switch (object.origin.type) {
            case "Rock":
                {
                    let vectorRockMe = {
                        x: this.pos.x - object.origin.pos.x,
                        y: this.pos.y - object.origin.pos.y
                    }
                    let magNewVector = Math.sqrt(Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2));
                    let bulletSpeed = Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2));
                    let scale = bulletSpeed / magNewVector;
                    let bounceFriction = .7;
                    this.speed.x = vectorRockMe.x * scale * bounceFriction;
                    this.speed.y = vectorRockMe.y * scale * bounceFriction;
                    break;
                }
            case "Human":
                this.delete = true;
                break;
            case "Score":
            case "Bullet":
                {
                    let newSpeed = {
                        x: object.copy.speed.x / 100 * 80,
                        y: object.copy.speed.y / 100 * 80
                    }
                    this.speed.x = newSpeed.x;
                    this.speed.y = newSpeed.y;
                    break;
                }
        }
    }
}

module.exports = {
    Sprite,
    Bullet,
    Human,
    Terrorist,
    Score
}