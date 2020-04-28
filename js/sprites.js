const { REAL_SIZE, MINUS_SIZE, BULLET_CONFIG } = require("../../my_modules/common.js");
const collide = require("../../my_modules/p5.collide.js");

class Sprite {
    constructor({ id, type, name, pos, size = 1, degree = 0, defaultRange = 0, getQueryRange, getBoundary } = {}) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.pos = {...pos};
        this.degree = degree;
        this.size = size;
        this.defaultRange = defaultRange;

        this.boundary;
        this.getQueryRange = getQueryRange || function() {
            return this.defaultRange * this.size;
        }

        this.getBoundary = getBoundary;
    }

    intersect(otherBoundary) {
        let myBoundary = this.getBoundary();
        debugger;
        let collideFunc1 = collide[`collide${myBoundary.type}${otherBoundary.type}`];
        let collideFunc2 = collide[`collide${otherBoundary.type}${myBoundary.type}`];

        if (collideFunc1) {
            return collideFunc1(...myBoundary.data, ...otherBoundary.data);
        } else {
            return collideFunc2(...otherBoundary.data, ...myBoundary.data)
        }
    }
}

class Bullet extends Sprite {
    constructor(config) {
        super(config);
    }

    update() {

    }
}

class Human extends Sprite {
    constructor(config) {
        super(config);
        let { bag } = config;
        this.bag = bag;
        this.keyDown = {};
        this.mouseDown = {};
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
        speed -= BULLET_CONFIG[holdingGun.name].weight;

        if (this.mouseDown["left"]) // do somthing with mouse left button
            speed--;

        if (this.keyDown["shift"]) // crouching
            speed *= 5 / 10;

        if (speed <= 1)
            speed = 1;

        return speed; //normal
    }

    update() {
        this.status.hideInTree = false;
        this.status.moving = false;

        let movingVector = {
            x: 0,
            y: 0
        }
        let movingSpeed = this.getMovingSpeed();
        for (let direction of this.directions) {
            if (this.keyDown[direction]) {
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
                    this.killerID = object.owner;
                break;
            case "Tree":
                this.status.hideInTree = true;
                break;
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
                this.size += object.value * 0.5;
                if (this.size > 3)
                    this.size = 3;
                break;
        }
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

class Terrorist extends Human {
    constructor(config) {
        super(config);
        this.type = "Gunner";
        this.bullets = [];
    }
}

module.exports = {
    Sprite,
    Bullet,
    Human,
    Terrorist
}