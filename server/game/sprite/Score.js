import CircleSprite from "./CircleSprite.js";
import * as Matter from "matter-js";
import random from "random";

class Score extends CircleSprite {
    constructor(config) {
        config = Object.assign({
                name: "Score"
            },
            config
        );
        super(config);
        const {
            matterBodyOption = {},
            value = 10,
        } = config;

        this._matterBodyOption = Object.assign({
            circleRadius: 10,
        }, matterBodyOption);
        this.matterBody = Matter.Bodies.circle(0, 0, this._matterBodyOption.circleRadius, this._matterBodyOption);
        this.value = value;
    }

    getSpeed() {
        return this.getScale() * 0.2;
    }

    update() {
        super.update();
        const scale = this.getScale();
        Matter.Body.scale(this.matterBody, scale, scale);
        const speed = this.getSpeed();
        const crPos = this.matterBody.position; // current position
        Matter.Body.set(this.matterBody, {
            velocity: {
                x: this.matterBody.velocity.x + random.float(-speed, speed),
                y: this.matterBody.velocity.y + random.float(-speed, speed)
            }
        });
    }

    collide(object) {
        switch (object.origin.type) {
            case "Rock":
                {
                    let vectorRockMe = {
                        x: this.pos.x - object.origin.pos.x,
                        y: this.pos.y - object.origin.pos.y
                    };
                    let magNewVector = Math.sqrt(
                        Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2)
                    );
                    let bulletSpeed = Math.sqrt(
                        Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2)
                    );
                    let scale = bulletSpeed / magNewVector;
                    let bounceFriction = 0.7;
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
                        x: (object.copy.speed.x / 100) * 80,
                        y: (object.copy.speed.y / 100) * 80
                    };
                    this.speed.x = newSpeed.x;
                    this.speed.y = newSpeed.y;
                    break;
                }
        }
    }

    getData() {
        return Object.assign(super.getData(), {
            value: this.value,
        });
    }
}

export default Score;