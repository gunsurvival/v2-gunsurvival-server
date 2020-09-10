import random from "random";
import axios from "axios";
import * as Matter from "matter-js";
import { Human } from "../human/";

class Bot extends Human {
    constructor(config = {}) {
        config = Object.assign({
            name: "Bot",
        }, config);
        super(config);

        const {
            matterBodyOption = {}
        } = config;

        this._matterBodyOption = Object.assign({
            circleRadius: 90,
            isStatic: true
        }, matterBodyOption);
        this.matterBody = Matter.Bodies.circle(0, 0, this._matterBodyOption.circleRadius, this._matterBodyOption);

        this.isBot = true;
        this.delayChangeDirection = 0;
    }

    update(room) {
        // super.update(room);
        if (this.delayChangeDirection > 0) {
            this.delayChangeDirection--;
        } else {
            const newDegree = random.int(0, 360);
            const newSpeed = {
                x: Math.cos((newDegree * Math.PI) / 180),
                y: Math.sin((newDegree * Math.PI) / 180)
            };
            const scale =
                this.getMovingSpeed() /
                Math.sqrt(Math.pow(newSpeed.x, 2) + Math.pow(newSpeed.y, 2));

            this.degree = newDegree;
            this.speed = {
                x: newDegree.x * scale,
                y: newDegree.y * scale
            };

            this.delayChangeDirection = 10;
        }

        super.update(room); // update normal person stuff

        const movingSpeed = this.getMovingSpeed();
        const movingVector = {
            x: Math.cos((this.degree * Math.PI) / 180),
            y: Math.sin((this.degree * Math.PI) / 180)
        };
        const magMovingVector = Math.sqrt(
            Math.pow(movingVector.x, 2) + Math.pow(movingVector.y, 2)
        );
        const scale = movingSpeed / magMovingVector;
        movingVector.x *= scale;
        movingVector.y *= scale;
        this.pos.x += movingVector.x;
        this.pos.y += movingVector.y;
        // end of update bot position

        const item = this.bag.arr[this.bag.index];
        item.update(room);
    }
}

export default Bot;