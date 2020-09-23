import * as Matter from "matter-js";
import CircleSprite from "../CircleSprite.js";
import Manager from "../../helper/Manager.js";
import { keyBind } from "../../helper/helperConfig.js";

class Player extends CircleSprite {
    constructor(config) {
        config = Matter.Common.extend({
            name: "Player"
        }, config);
        super(config);
        const { playerName } = config;
        this.logkmManager = new Manager();
        this.playerName = playerName;
    }

    update(queueAddSprites) {
        super.update(queueAddSprites);

        const movingVector = Matter.Vector.create(0, 0);
        const movingSpeed = this.getMovingSpeed();
        const directionCode = {
            87: "up", //w
            65: "left", //a
            83: "down", //s
            68: "right", //d
        }
        for (const keyCode in directionCode) {
            const logkm = this.logkmManager.find({
                keyCode,
                value: true
            });
            if (logkm) {
                this.status.moving = true;
                switch (directionCode[keyCode]) {
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
        const magMovingVector = Matter.Vector.magnitude(movingVector);
        const scale = (magMovingVector > 0) ? (movingSpeed / magMovingVector) : 1; // neu mag = 0 thi se khong chia duoc cho 0
        const speed = Matter.Vector.mult(movingVector, scale);
        // Matter.Body.applyForce(this.matterBody, this.matterBody.position, speed)
        Matter.Body.set(this.matterBody, {
            velocity: speed
        });
    }

    getMovingSpeed() {
        return 0;
    }

    getData() {
        return Object.assign(super.getData(), {
            playerName: this.playerName
        });
    }
}

export default Player;