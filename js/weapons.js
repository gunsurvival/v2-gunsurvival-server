const random = require('random');
const randomNormal = require('random-normal');

import { Config, Sprites, Convert } from "./utils.js";
const { REAL_SIZE, MINUS_SIZE, ITEM_CONFIG } = Config;

class Item {
    // constructor({ owner, name, round, reload, weight, delayHold, delayFire } = {}) {
    constructor({ ownerID, name, id } = {}) {
        let { weight, delayHold } = ITEM_CONFIG[name];
        this.name = name;
        this.ownerID = ownerID;
        this.id = id;
        this.weight = weight;
        this.delayHold = delayHold;
        this.delay = this.delayHold;
    }

    isDelay() {
        return this.delay > 0;
    }

    resetDelay() {
        this.delay = this.delayHold;
    }

    wait(tick) {
        this.delay = tick;
    }

    update(room) {
        if (this.isDelay()) {
            this.delay--;
            return;
        }
    }
}

class Gun extends Item {
    constructor(config) {
        super(config);
        let { bulletCount, magazine } = config;
        this.bulletCount = bulletCount;
        this.magazine = magazine;
    }
}

class Automatic extends Gun {
    constructor(config) {
        super(config);
    }

    update(room) {
        super.update(room);
        let owner = room.findObject("gunners", this.ownerID);
        if (!owner)
            return;
        if (owner.mouseDown['left'] && !this.isDelay()) {
            let { imgName, size, delayFire, speed, friction, dev, round, reload } = ITEM_CONFIG[this.name];
            this.wait(delayFire);

            let status = "running";
            if (!owner.status.moving)
                status = "staying";
            else
                if (owner.keyDown['shift']) // walking
                    status = "walking";

            let noise = randomNormal({
                mean: 0,
                dev: Math.PI / 180 * (dev[status] / 4)
            });

            let radian = Convert.degreesToRadians(owner.degree);
            let dx = Math.cos(radian); // default speed x, y for get starPos of bullet
            let dy = Math.sin(radian);
            let magDefault = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            let scaleDefault = 20 / magDefault;
            let startPos = { // vị trí bắn ở đầu nhân vật
                x: owner.pos.x + dx * scaleDefault,
                y: owner.pos.y + dy * scaleDefault,
            };

            let radianSpeed = radian + noise;
            let sx = Math.cos(radianSpeed); // nx means noised position x
            let sy = Math.sin(radianSpeed);
            let magSpeed = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
            let scaleSpeed = speed / magSpeed; // scale cho cái speed = bulletconfig>speed
            let speedVector = { // vector speed đạn 
                x: sx * scaleSpeed,
                y: sy * scaleSpeed
            };

            room.addObject("bullets", new Sprites.Bullet({
                id: Date.now(),
                type: this.name,
                name: this.name,
                pos: startPos,
                defaultRange: 25,
                size,
                ownerID: owner.id,
                speed: speedVector, //vector bullet go
                friction,
                imgName
            }));
        }
    }
}

module.exports = {
    Item,
    Gun,
    Automatic,
    // Shotgun,
    // Sniper,
    // Pistol
}
