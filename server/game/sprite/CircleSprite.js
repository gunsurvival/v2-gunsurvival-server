import uniqid from "uniqid";
import * as Matter from "matter-js";
import Sprite from "./Sprite.js";

class CircleSprite extends Sprite {
    // getQueryRange ko can truyen cung duoc
    constructor(config) {
        super(config);

        const {
        	matterBodyOption = {}
        } = config;

        this._matterBodyOption = Object.assign({
            circleRadius: 90,
            isStatic: true
        }, matterBodyOption);
        this.matterBody = Matter.Bodies.circle(0, 0, this._matterBodyOption.circleRadius, this._matterBodyOption);
    }

    update() {
        this.frameCount++;
        const scale = this.getScale();
        if (scale != this._scale) // neu khac scale truoc do thi moi scale (optimize)
            Matter.Body.scale(this.matterBody, scale, scale);
    }

    getScale() { // get scale for circle body
        const scale = this.matterBody.circleRadius / this._matterBodyOption.circleRadius;
        this._scale = scale;
        return scale;
    }

    getData() {
        return Object.assign(super.getData(), {
            _circleRadius: this._circleRadius,
        });
    }
}

export default CircleSprite;