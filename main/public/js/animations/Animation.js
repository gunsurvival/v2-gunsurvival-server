export default class Animation {
	constructor({
		id, //***
		name = "Unknown Animation",
		liveTime = 0,
		infinite = true,
		invisible = false,
		// vị trí
		pos = {x: 0, y: 0},
		smoothMove = true,
		speedMove = 0.1,
		// phóng to/nhỏ
		scale = 1,
		smoothScale = true,
		speedScale = 0.05,
		// góc quay (rotation)
		angle = 0,
		smoothRotate = true,
		speedRotate = 0.05
	} = {}) {
		this.id = id; // identify cho animation
		this.name = name; // tên của animation (hiện tại đang dùng cái này để duyệt ảnh cho window.GameImages)
		this.liveTime = liveTime; // thông số chỉ thời gian sống sót
		this._liveTime = liveTime; // lưu trữ liveTime lại cho function this.reBorn()
		this.infinite = infinite; // bật mode thanos éo bao giờ hết liveTime nhưng bị counter bằng this.delete()
		this.invisible = invisible; // bật mode tàng hình cho animation

		this.pos = new SAT.Vector(pos.x, pos.y); // vị trí
		this.targetPos = new SAT.Vector(this.pos.x, this.pos.y); // đích đến của pos
		this.smoothMove = smoothMove; // làm mượt độ biến thiên giá trị của3 this.pos
		this.speedMove = speedMove; // tốc độ làm mượt (càng nhỏ càng chậm)

		this.scale = scale; // chỉ số tăng size (1 = bình thường)
		this.targetScale = scale; // đích đến của scale
		this.smoothScale = smoothScale; // làm mượt độ biến thiên giá trị của this.scale
		this.speedScale = speedScale; // tốc độ làm mượt (càng nhỏ càng chậm)

		this.angle = angle; // góc quay (radians)
		this.targetAngle = angle; // đích đến của rotate
		this.smoothRotate = smoothRotate; // làm mượt độ biến thiên giá trị của this.angle
		this.speedRotate = speedRotate; // tốc độ làm mượt (càng nhỏ càng chậm)

		this.deleted = false; // deleted = true thì auto bị bay ra khỏi hàng chờ vẽ animation
		this.frameCount = 0; // đếm frameCount
	}

	update(sketch) {
		// update các logic của animation (position, image, status ...)
		this.frameCount++;
		if (!this.infinite) {
			// nếu không bất tử thì sẽ tính thời gian sống
			this.liveTime--;
			if (this.liveTime <= 0) this.deleted = true;
		}

		// cập nhật this.pos
		if (this.smoothMove) {
			this.pos.x = sketch.lerp(this.pos.x, this.targetPos.x, this.speedMove);
			this.pos.y = sketch.lerp(this.pos.y, this.targetPos.y, this.speedMove);
		} else {
			this.pos.x = this.targetPos.x;
			this.pos.y = this.targetPos.y;
		}
		// cập nhật this.scale
		if (this.smoothScale) {
			this.scale = sketch.lerp(this.scale, this.targetScale, this.speedScale);
		} else {
			this.scale = this.targetScale;
		}
		// cập nhật this.angle
		if (this.smoothRotate) {
			this.angle = sketch.lerp(this.angle, this.targetAngle, this.speedRotate);
		} else {
			this.angle = this.targetAngle;
		}
	}

	destroy() {
		this.deleted = true;
	}

	reBorn() {
		// có thể hiểu là reset lại this.liveTime
		this.liveTime = this._liveTime;
	}

	follow(sprite) {
		// copy vị trí của 1 sprite
		this.targetPos = sprite.pos;
	}

	unfollow() {
		// ngừng copy vị trí của 1 sprite
		this.targetPos = {
			...this.targetPos
		};
	}

	moveTo(x, y) {
		// set vị trí, hay nói cách khác là di chuyển tới 1 tọa độ x, y
		if (typeof x == "object") {
			// moveTo(pos = {x: , y: })
			this.targetPos.x = x.x;
			this.targetPos.y = x.y;
		} else {
			this.targetPos.x = x; // (moveTo(x,y))
			this.targetPos.y = y;
		}
	}

	stopMove() {
		// dừng di chuyển
		this.targetPos.x = this.pos.x;
		this.targetPos.y = this.pos.y;
	}

	scaleTo(scaleValue) {
		// set giá trị phóng to hoặc làm nhỏ
		this.targetScale = scaleValue;
	}

	stopScale() {
		// dừng scale lại
		this.targetScale = this.scale;
	}

	rotateTo(angle) {
		// set giá trị góc, (quay nó ở x radians)
		this.angle %= 2 * Math.PI;
		const alpha = this.angle;
		const beta = angle;
		const rotates = [
			// tất cả trường hợp quay
			{
				result: Math.abs(alpha - beta),
				beta: angle
			},
			{
				result: Math.abs(alpha - (beta + 2 * Math.PI)),
				beta: beta + 2 * Math.PI
			},
			{
				result: Math.abs(alpha - (beta - 2 * Math.PI)),
				beta: beta - 2 * Math.PI
			}
		];
		rotates.sort((a, b) => a.result - b.result);
		this.targetAngle = rotates[0].beta; // lấy giá trị nhỏ nhất của góc quay
	}

	stopRotate() {
		// dừng quoay
		this.targetAngle = this.angle;
	}
}
