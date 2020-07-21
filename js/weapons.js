const random = require('random');
const randomNormal = require('random-normal');

import { Config, Sprites, Convert } from "./utils.js";
const { REAL_SIZE, MINUS_SIZE, ITEM_CONFIG } = Config;

class Item {
    // constructor({ owner, name, round, reload, weight, delayHold, fire } = {}) {
    constructor({ ownerID, name, id } = {}) {
        Object.assign(this, ITEM_CONFIG[name]);
        this.id = id;
        this.delay = 0;
        this.name = name;
        this.queueDelay = [];
        this.ownerID = ownerID;
        this.take();
    }

    isDelay() {
        return this.delay > 0;
    }

    take() {
        this.queueDelay = [{
            name: "hold",
            callback: null
        }];
    }

    addDelay(name, callback) {
        this.queueDelay.push({
            name,
            callback
        });
    }

    update(room) {
        if (this.isDelay()) {
            this.delay--;
        } else {
            if (this.queueDelay.length > 0){
                let newDelayData = this.queueDelay.splice(0, 1);
                this.delay = this[newDelayData.name];
            }
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

    reloadBullet() {
        this.addDelay('reload');
    }
}

class Automatic extends Gun {
    constructor(config) {
        super(config);
    }

    take() {
        super.take();
        if (this.bulletCount <= 0) {
            this.reloadBullet();
        }
    }

    isReloading() {
        return this.queueDelay.findIndex(e => e.name == "reload") != -1;
    }

    update(room) {
        super.update(room);
        let owner = room.findObject("gunners", this.ownerID);
        if (!owner)
            return;
        if (owner.mouseDown['left'] && !this.isDelay() && this.bulletCount > 0) {
            this.addDelay('fire');

            let status = "running";
            if (!owner.status.moving)
                status = "staying";
            else
            if (owner.keyDown['shift']) // walking
                status = "walking";

            let noise = randomNormal({
                mean: 0,
                dev: Math.PI / 180 * (this.dev[status] / 4)
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
            let scaleSpeed = this.speed / magSpeed; // scale cho cái speed = bulletconfig>speed
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
                size: this.size,
                ownerID: owner.id,
                speed: speedVector, //vector bullet go
                friction: this.friction,
                imgName: this.imgName
            }));
            this.bulletCount--;
        } else {
            if (this.bulletCount <= 0 && !this.isReloading()) {
                this.reloadBullet();
                console.log(this.queueDelay)
            }
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