import * as Matter from "matter-js";
import Sprite from "./Sprite.js";

class CircleSprite extends Sprite {
    constructor(config={}) {
    	config = Matter.Common.extend({
    		name: "CircleSprite",
    		matterBodyOption: {
    			circleRadius: 90
    		}
    	}, config);
        super(config);

        const {
        	matterBodyOption
        } = config;

        this._matterBodyOption = matterBodyOption;
        this.matterBody = Matter.Bodies.circle(
            0,
            0,
            this._matterBodyOption.circleRadius,
            this._matterBodyOption
        );
    }

    update(queueAddSprites) {
        super.update(queueAddSprites);
        
        this.frameCount++;
        const scale = this.getScale();
        if (scale != this._scale) { // neu khac scale truoc do thi moi scale (optimize)
            Matter.Body.scale(this.matterBody, scale, scale);
            this._scale = scale; // lưu scale trước đó lại
        }
    }

    getScale() { // get scale for circle body
        const scale = this.matterBody.circleRadius / this._matterBodyOption.circleRadius;
        return scale;
    }

    getData() {
        return Object.assign(super.getData(), {
            _circleRadius: this._circleRadius,
        });
    }
}

export default CircleSprite;