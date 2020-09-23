import random from "random";
import axios from "axios";
import * as Matter from "matter-js";
import { Human } from "../human/";

class Bot extends Human {
    constructor(config = {}) {
        config = Matter.Common.extend({

        }, config);
        super(config);
        const { botName } = config;

        this.botName = botName;
        this.isBot = true;

        const rotate = random.float(0, Math.PI * 2); // first random rotate
        this.speed = Matter.Vector.create(
            Math.cos(rotate) * this.getMovingSpeed(), // magnitute cua x: cosa, y: siny luon bang 1
            Math.sin(rotate) * this.getMovingSpeed()
        );
    }

    update() {
        super.update();
        if (this.frameCount % 15 == 0) {
            const rotate = random.float(0, Math.PI * 2); // radians
            this.speed = Matter.Vector.create(
                Math.cos(rotate) * this.getMovingSpeed(), // magnitute cua x: cosa, y: siny luon bang 1
                Math.sin(rotate) * this.getMovingSpeed()
            );
            Matter.Body.set(this.matterBody, {
                angle: rotate
            });
        }
        Matter.Body.set(this.matterBody, {
            velocity: this.speed
        });
        // end of update bot position

        // const item = this.bag.arr[this.bag.index];
    }

    getData() {
        return Matter.Common.extend({
            botName: this.botName
        }, super.getData());
    }
}

export default Bot;