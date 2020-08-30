class Point {
	constructor(t, e, i) {
		(this.x = t), (this.y = e), (this.userData = i);
	}
}
class Rectangle {
	constructor(t, e, i, s) {
		(this.x = t), (this.y = e), (this.w = i), (this.h = s);
	}
	get left() {
		return this.x - this.w / 2;
	}
	get right() {
		return this.x + this.w / 2;
	}
	get top() {
		return this.y - this.h / 2;
	}
	get bottom() {
		return this.y + this.h / 2;
	}
	contains(t) {
		return (
			t.x >= this.x - this.w &&
			t.x <= this.x + this.w &&
			t.y >= this.y - this.h &&
			t.y <= this.y + this.h
		);
	}
	intersects(t) {
		return !(
			t.x - t.w > this.x + this.w ||
			t.x + t.w < this.x - this.w ||
			t.y - t.h > this.y + this.h ||
			t.y + t.h < this.y - this.h
		);
	}
}
class Circle {
	constructor(t, e, i) {
		(this.x = t),
			(this.y = e),
			(this.r = i),
			(this.rSquared = this.r * this.r);
	}
	contains(t) {
		return (
			Math.pow(t.x - this.x, 2) + Math.pow(t.y - this.y, 2) <=
			this.rSquared
		);
	}
	intersects(t) {
		let e = Math.abs(t.x - this.x),
			i = Math.abs(t.y - this.y),
			s = this.r,
			h = t.w,
			r = t.h,
			n = Math.pow(e - h, 2) + Math.pow(i - r, 2);
		return (
			!(e > s + h || i > s + r) &&
			(e <= h || i <= r || n <= this.rSquared)
		);
	}
}
class QuadTree {
	constructor(t, e) {
		if (!t) throw TypeError("boundary is null or undefined");
		if (!(t instanceof Rectangle))
			throw TypeError("boundary should be a Rectangle");
		if ("number" != typeof e)
			throw TypeError(`capacity should be a number but is a ${typeof e}`);
		if (e < 1) throw RangeError("capacity must be greater than 0");
		(this.boundary = t),
			(this.capacity = e),
			(this.points = []),
			(this.divided = !1);
	}
	static create(width, height) {
		if (0 === arguments.length) {
			if ("undefined" == typeof width)
				throw new TypeError("No global width defined");
			if ("undefined" == typeof height)
				throw new TypeError("No global height defined");
			let t = new Rectangle(width / 2, height / 2, width, height);
			return new QuadTree(t, 8);
		}
		if (arguments[0] instanceof Rectangle) {
			let t = arguments[1] || 8;
			return new QuadTree(arguments[0], t);
		}
		if (
			"number" == typeof arguments[0] &&
			"number" == typeof arguments[1] &&
			"number" == typeof arguments[2] &&
			"number" == typeof arguments[3]
		) {
			let t = arguments[4] || 8;
			return new QuadTree(
				new Rectangle(
					arguments[0],
					arguments[1],
					arguments[2],
					arguments[3]
				),
				t
			);
		}
		throw new TypeError("Invalid parameters");
	}
	toJSON(t) {
		let e = {
			points: this.points
		};
		return (
			this.divided &&
				(this.northeast.points.length > 0 &&
					(e.ne = this.northeast.toJSON(!0)),
				this.northwest.points.length > 0 &&
					(e.nw = this.northwest.toJSON(!0)),
				this.southeast.points.length > 0 &&
					(e.se = this.southeast.toJSON(!0)),
				this.southwest.points.length > 0 &&
					(e.sw = this.southwest.toJSON(!0))),
			t ||
				((e.capacity = this.capacity),
				(e.x = this.boundary.x),
				(e.y = this.boundary.y),
				(e.w = this.boundary.w),
				(e.h = this.boundary.h)),
			e
		);
	}
	static fromJSON(t, e, i, s, h, r) {
		if (void 0 === e) {
			if (!("x" in t))
				throw TypeError("JSON missing boundary information");
			(e = t.x), (i = t.y), (s = t.w), (h = t.h), (r = t.capacity);
		}
		let n = new QuadTree(new Rectangle(e, i, s, h), r);
		if (
			((n.points = t.points),
			"ne" in t || "nw" in t || "se" in t || "sw" in t)
		) {
			let e = n.boundary.x,
				i = n.boundary.y,
				s = n.boundary.w / 2,
				h = n.boundary.h / 2;
			(n.northeast =
				"ne" in t
					? QuadTree.fromJSON(t.ne, e + s, i - h, s, h, r)
					: new QuadTree(new Rectangle(e + s, i - h, s, h), r)),
				(n.northwest =
					"nw" in t
						? QuadTree.fromJSON(t.nw, e - s, i - h, s, h, r)
						: new QuadTree(new Rectangle(e - s, i - h, s, h), r)),
				(n.southeast =
					"se" in t
						? QuadTree.fromJSON(t.se, e + s, i + h, s, h, r)
						: new QuadTree(new Rectangle(e + s, i + h, s, h), r)),
				(n.southwest =
					"sw" in t
						? QuadTree.fromJSON(t.sw, e - s, i + h, s, h, r)
						: new QuadTree(new Rectangle(e - s, i + h, s, h), r)),
				(n.divided = !0);
		}
		return n;
	}
	subdivide() {
		let t = this.boundary.x,
			e = this.boundary.y,
			i = this.boundary.w / 2,
			s = this.boundary.h / 2,
			h = new Rectangle(t + i, e - s, i, s);
		this.northeast = new QuadTree(h, this.capacity);
		let r = new Rectangle(t - i, e - s, i, s);
		this.northwest = new QuadTree(r, this.capacity);
		let n = new Rectangle(t + i, e + s, i, s);
		this.southeast = new QuadTree(n, this.capacity);
		let o = new Rectangle(t - i, e + s, i, s);
		(this.southwest = new QuadTree(o, this.capacity)), (this.divided = !0);
	}
	insert(t) {
		return (
			!!this.boundary.contains(t) &&
			(this.points.length < this.capacity
				? (this.points.push(t), !0)
				: (this.divided || this.subdivide(),
				  this.northeast.insert(t) ||
						this.northwest.insert(t) ||
						this.southeast.insert(t) ||
						this.southwest.insert(t)))
		);
	}
	query(t, e) {
		if ((e || (e = []), !t.intersects(this.boundary))) return e;
		for (let i of this.points) t.contains(i) && e.push(i);
		return (
			this.divided &&
				(this.northwest.query(t, e),
				this.northeast.query(t, e),
				this.southwest.query(t, e),
				this.southeast.query(t, e)),
			e
		);
	}
	closest(t, e, i) {
		if (void 0 === t) throw TypeError("Method 'closest' needs a point");
		if ((void 0 === e && (e = 1), 0 == this.length)) return [];
		if (this.length < e) return this.points;
		if (void 0 === i) {
			i =
				Math.sqrt(
					Math.pow(this.boundary.w, 2) + Math.pow(this.boundary.h, 2)
				) + Math.sqrt(Math.pow(t.x, 2) + Math.pow(t.y, 2));
		}
		let s,
			h = 0,
			r = i,
			n = 8;
		for (; n > 0; ) {
			const i = (h + r) / 2,
				o = new Circle(t.x, t.y, i);
			if ((s = this.query(o)).length === e) return s;
			s.length < e ? (h = i) : ((r = i), n--);
		}
		return (
			s.sort((e, i) => {
				return (
					Math.pow(t.x - e.x, 2) +
					Math.pow(t.y - e.y, 2) -
					(Math.pow(t.x - i.x, 2) + Math.pow(t.y - i.y, 2))
				);
			}),
			s.slice(0, e)
		);
	}
	forEach(t) {
		this.points.forEach(t),
			this.divided &&
				(this.northeast.forEach(t),
				this.northwest.forEach(t),
				this.southeast.forEach(t),
				this.southwest.forEach(t));
	}
	merge(t, e) {
		let i = Math.min(this.boundary.left, t.boundary.left),
			s = Math.max(this.boundary.right, t.boundary.right),
			h = Math.min(this.boundary.top, t.boundary.top),
			r = Math.max(this.boundary.bottom, t.boundary.bottom) - h,
			n = s - i,
			o = new Rectangle(i + n / 2, h + r / 2, n, r),
			a = new QuadTree(o, e);
		return this.forEach(t => a.insert(t)), t.forEach(t => a.insert(t)), a;
	}
	get length() {
		let t = this.points.length;
		return (
			this.divided &&
				((t += this.northwest.length),
				(t += this.northeast.length),
				(t += this.southwest.length),
				(t += this.southeast.length)),
			t
		);
	}
}
"undefined" != typeof module &&
	(module.exports = {
		Point: Point,
		Rectangle: Rectangle,
		QuadTree: QuadTree,
		Circle: Circle
	});
