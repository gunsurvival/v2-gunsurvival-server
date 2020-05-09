const random = require('random');
const randomNormal = require('random-normal');

import { Config, Sprites } from "./utils.js";
const { REAL_SIZE, MINUS_SIZE, ITEM_CONFIG } = Config;

class Item {
    // constructor({ owner, name, round, reload, weight, delayHold, delayFire } = {}) {
    constructor({ owner, name, id, room } = {}) {
        let { weight, delayHold } = ITEM_CONFIG[name];
        this.owner = owner; // Human owner
        this.name = name;
        this.id = id;
        this.weight = weight;
        this.delayHold = delayHold;
        this.delay = this.delayHold;
        this.room = room;
    }

    switch() {
        this.resetDelay();
    }

    isDelay() {
        return this.delay > 0;
    }

    resetDelay() {
        this.delay = this.delayHold;
    }

    delay(tick) {
        this.delay = tick;
    }

    update() {
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

    shoot() {
        let { imgName, size, delayFire, speed, friction, dev, round, reload} = ITEM_CONFIG[this.name];

        let status = "running";
        if (!this.owner.status.moving)
            status = "staying";
        else
            if (this.owner.keyDown['shift']) // walking
                status = "walking";

        let noise = randomNormal({
            mean: 0,
            dev: Math.PI / 180 * (dev[status] / 4)
        });

        let radian = degreesToRadians(this.owner.degree);
        let dx = Math.cos(radian); // default speed x, y for get starPos of bullet
        let dy = Math.sin(radian);
        let magDefault = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        let scaleDefault = 20 / magDefault;
        let startPos = { // vị trí bắn ở đầu nhân vật
            x: this.owner.pos.x + dx * scaleDefault,
            y: this.owner.pos.y + dy * scaleDefault,
        };

        let radianSpeed = radian + noise;
        let sx = Math.cos(radianSpeed); // nx means noised position x
        let sy = Math.sin(radianSpeed);
        let magSpeed = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
        let scaleSpeed = random.int(speed - 20, speed + 20) / magSpeed; // scale cho cái speed = bulletconfig>speed
        let speedVector = { // vector speed đạn 
            x: sx * scaleSpeed,
            y: sy * scaleSpeed
        };

        this.room.activeObjects.bullets.push(new Sprites.Bullet({
            owner: this.owner,
            speed: speedVector, //vector bullet go
            friction,
            imgName
        }));
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
