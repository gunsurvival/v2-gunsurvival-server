const MY_MODULE_DIR = `${__dirname}/../my_modules/`;

const random = require('random');
const randomNormal = require('random-normal');
const { Point, Rectangle, QuadTree, Circle } = require(`${MY_MODULE_DIR}quadtree.js`);
const { BULLET_CONFIG, REAL_SIZE, MINUS_SIZE } = require(`${MY_MODULE_DIR}config.js`);
const { degreesToRadians, radiansToDegrees, movingSpeed, checkCollide, movePlayer } = require(`${MY_MODULE_DIR}common.js`);

const {
    workerData,
    parentPort
} = require('worker_threads');

let {
    myId,
    room
} = workerData;

let myGunnerIndex = room.activeObjects.gunners.findIndex(e => e.id == myId);
let gunner = gunners[myGunnerIndex];

let bulletID = 0;
let myJob;

let boundary = new Rectangle(0, 0, worldSize.width, worldSize.height);

let qtreeStatic = new QuadTree(boundary, 4); // quadtree cho vật tĩnh (map)
for (let object of map) {
    let point = new Point(object.pos.x, object.pos.y, object);
    qtreeStatic.insert(point);
}

parentPort.on('message', (result) => { // refresh move
    switch (result.name) {
        case 'request':            
            room = result.room;
            break;
    }
});

myJob = setInterval(() => {
    if (myIndex == -1) {
        return;
    }

    holdingCoolDownIsChanged = false;

    let qtreeActiveActive = new QuadTree(boundary, 4); // quadtree cho những vật động

    for (let object of allBullets) {
        switch (object.type) {
            case "Bullet":
                for (let bullet of object.arr) {
                    let point = new Point(bullet.pos.x, bullet.pos.y, bullet);
                    qtreeActive.insert(point);
                }
                break;
        }
    }

    for (let otherGunner of gunners) {
        if (otherGunner.id != gunner.id) {
            let point = new Point(otherGunner.pos.x, otherGunner.pos.y, otherGunner);
            qtreeActive.insert(point);
        }
    }

    treesCollide.length = 0;
    let checkMoving = false;

    if (move.up && move.down) {
        move.up = false;
        move.down = false;
    }

    if (move.left && move.right) {
        move.left = false;
        move.right = false;
    }

    let lastPosition = { ...position }; // cái này để check cái va chạm ô vuông phía dưới

    movePlayer(gunner);

    let deleteBullets = [];

    // kiểm tra các vật trong tầm va chạm giữa mình và các vật

    let range = new Circle(position.x, position.y, 200 + 20);

    let mapPoints = qtreeActiveStatic.query(range); // static point

    for (let point of mapPoints) {
        let other = point.userData;
        if (checkCollide(position, 80, other)) {
            switch (other.type) { // làm những việc sau khi bị va chạm
                case 'Rock':
                    let xanh = {
                        x: position.x,
                        y: position.y,
                    };
                    let tam = {
                        x: other.pos.x,
                        y: other.pos.y,
                    };
                    let distance_xanh_tam = Math.sqrt(Math.pow(xanh.x - tam.x, 2) + Math.pow(xanh.y - tam.y, 2));
                    if (distance_xanh_tam == 0) {
                        distance_xanh_tam = 1;
                        xanh.x += Math.random();
                        xanh.y += Math.random();
                    }
                    let red;
                    let radius = (80 + (REAL_SIZE[other.type] * other.size - MINUS_SIZE[other.type])) / 2;

                    red = {
                        x: (radius * (xanh.x - tam.x)) / distance_xanh_tam + tam.x,
                        y: (radius * (xanh.y - tam.y)) / distance_xanh_tam + tam.y,
                    };

                    position = {
                        ...red
                    };

                    break;
                case 'Tree':
                    if (treesCollide.indexOf(other.id) == -1) {
                        treesCollide.push(other.id);
                    }
                    break;
                case 'Box_emty':
                case 'Box_wooden':
                case 'Roof_brown':
                    let sizeBox = {
                        width: REAL_SIZE[other.type].width * other.size - MINUS_SIZE[other.type].width / 2,
                        height: REAL_SIZE[other.type].height * other.size - MINUS_SIZE[other.type].height / 2
                    }
                    let leftSide = other.pos.x - sizeBox.width / 2,
                        rightSide = other.pos.x + sizeBox.width / 2,
                        topSide = other.pos.y - sizeBox.height / 2,
                        bottomSide = other.pos.y + sizeBox.height / 2;

                    let sides = [];
                    let testX = position.x;
                    let testY = position.y;

                    // which edge is closest?
                    if (position.x < leftSide) {
                        testX = leftSide; // test left edge
                        sides.push('left');
                    } else if (position.x > rightSide) {
                        testX = rightSide; // right edge
                        sides.push('right');
                    }
                    if (position.y < topSide) {
                        testY = topSide; // top edge
                        sides.push('top');
                    } else if (position.y > bottomSide) {
                        testY = bottomSide; // bottom edge
                        sides.push('bottom');
                    }
                    let fitW = 40 + MINUS_SIZE[other.type].width / 2;
                    let fitH = 40 + MINUS_SIZE[other.type].height / 2;
                    if (sides.length > 1) {
                        fitW -= MINUS_SIZE[other.type].width / 2;
                        fitH -= MINUS_SIZE[other.type].height / 2;
                    }
                    for (let side of sides) {
                        switch (side) {
                            case "left":
                                position.x = leftSide - fitW;
                                break;
                            case "right":
                                position.x = rightSide + fitW;
                                break;
                            case "top":
                                position.y = topSide - fitH;
                                break;
                            case "bottom":
                                position.y = bottomSide + fitH;
                                break;
                        }
                    }
                    break;
            }
        }
    }

    let points = qtreeActive.query(range); // tìm các điểm mà mình va chạm với vật động

    for (let point of points) {
        let other = point.userData;
        if (checkCollide(position, 80, other)) {
            switch (other.type) { // làm những việc sau khi bị va chạm
                case 'Gunner':
                    let xanh = {
                        x: position.x,
                        y: position.y,
                    };
                    let tam = {
                        x: other.pos.x,
                        y: other.pos.y,
                    };
                    let distance_xanh_tam = Math.sqrt(Math.pow(xanh.x - tam.x, 2) + Math.pow(xanh.y - tam.y, 2));
                    if (distance_xanh_tam == 0) {
                        distance_xanh_tam = 1;
                        xanh.x += Math.random();
                        xanh.y += Math.random();
                    }
                    let red;
                    let radius = (80 + (REAL_SIZE[other.type] * other.size - MINUS_SIZE[other.type])) / 2;

                    red = {
                        x: (radius * (xanh.x - tam.x)) / distance_xanh_tam + tam.x,
                        y: (radius * (xanh.y - tam.y)) / distance_xanh_tam + tam.y,
                    };

                    position = {
                        ...red
                    };

                    break;
                case 'Bullet':
                    if (other.owner == gunner.id) {
                        break;
                    }
                    let bSpeed = Math.sqrt(Math.pow(other.speed.x, 2) + Math.pow(other.speed.y, 2)) // bullet speed
                    let bDSpeed = 120 // bullet default speed
                    let damage = 100 / 2 * (bSpeed / bDSpeed) * other.size; // damage chia 2 vi eo hieu sao no bi dinh dan 2 lan :(
                    blood -= Math.round(damage);
                    if (blood <= 0) {
                        killedBy = other.owner;
                    }
                    deleteBullets.push(other);
                    break;
            }
        }
    }


    // Bullet things
    for (let index = 0; index < bullets.length; index++) {
        let bullet = bullets[index];

        if (bullet.delete) { // died
            bullets.splice(index, 1);
            index--;
        } else { // alive
            bullet.pos.x += bullet.speed.x;
            bullet.pos.y += bullet.speed.y;
            bullet.speed.x *= bullet.friction;
            bullet.speed.y *= bullet.friction;
            if (Math.sqrt(Math.pow(bullet.speed.x, 2) + Math.pow(bullet.speed.y, 2)) <= 0.1) {
                bullet.delete = true;
            }
            //kiểm tra các vật va chạm giữa các viên đạn và các vật khác
            let range = new Circle(bullet.pos.x, bullet.pos.y, 16 + 200);

            let mapPoints = qtreeActiveStatic.query(range); // static point

            for (let point of mapPoints) {
                let other = point.userData;
                let bRadius = REAL_SIZE[BULLET_CONFIG[bullet.name].imgName] * BULLET_CONFIG[bullet.name].size - MINUS_SIZE[BULLET_CONFIG[bullet.name].imgName];
                if (checkCollide(bullet.pos, bRadius, other)) {
                    switch (other.type) {
                        case 'Rock':
                            if (bullet.name == 'rpg' && !bullet.delete) {
                                bullet.delete = true;
                                for (let i = 0; i < 20; i++) {
                                    let radian = degreesToRadians(random.float(0, 359));
                                    let dx = Math.cos(radian); // default speed x, y for get starPos of bullet
                                    let dy = Math.sin(radian);
                                    let magDefault = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                                    let scaleDefault = 20 / magDefault;
                                    let startPos = { // vị trí bắn ở đầu nhân vật
                                        x: bullet.pos.x + dx * scaleDefault,
                                        y: bullet.pos.y + dy * scaleDefault,
                                    };

                                    let radianSpeed = radian;
                                    let sx = Math.cos(radianSpeed); // nx means noised position x
                                    let sy = Math.sin(radianSpeed);
                                    let magSpeed = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
                                    let scaleSpeed = random.int(65, 95) / magSpeed; // scale cho cái speed = bulletconfig>speed
                                    let speed = { // vector speed đạn 
                                        x: sx * scaleSpeed,
                                        y: sy * scaleSpeed
                                    };

                                    let friction = 0.7;

                                    bullets.push({
                                        owner: gunner.id,
                                        name: 'rpg_split',
                                        id: `${gunner.id}|${bulletID++}(split${i})`,
                                        type: 'Bullet',
                                        speed,
                                        size: 0.7,
                                        friction,
                                        degree: radiansToDegrees(radianSpeed),
                                        pos: startPos,
                                        delete: false,
                                        imgName: "bullet"
                                    });
                                }
                                break;
                            }

                            let bounceVector = {
                                x: (bullet.pos.x - bullet.speed.x) - other.pos.x,
                                y: (bullet.pos.y - bullet.speed.y) - other.pos.y
                            }
                            let magBounce = Math.sqrt(Math.pow(bounceVector.x, 2) + Math.pow(bounceVector.y, 2));
                            let magSpeed = Math.sqrt(Math.pow(bullet.speed.x, 2) + Math.pow(bullet.speed.y, 2));
                            let scale = magSpeed / magBounce;
                            let newSpeed = {
                                x: (bounceVector.x * scale) / 2,
                                y: (bounceVector.y * scale) / 2
                            }
                            bullet.speed.x = newSpeed.x;
                            bullet.speed.y = newSpeed.y;

                            break;
                        case 'Tree':
                            bullet.speed.x *= 0.85;
                            bullet.speed.y *= 0.85;
                            break;
                        case 'Box_emty':
                        case 'Box_wooden':
                        case 'Roof_brown':
                            let sizeBox = {
                                width: REAL_SIZE[other.type].width * other.size - MINUS_SIZE[other.type].width / 2,
                                height: REAL_SIZE[other.type].height * other.size - MINUS_SIZE[other.type].height / 2
                            }
                            let leftSide = other.pos.x - sizeBox.width / 2,
                                rightSide = other.pos.x + sizeBox.width / 2,
                                topSide = other.pos.y - sizeBox.height / 2,
                                bottomSide = other.pos.y + sizeBox.height / 2;

                            let sides = [];
                            let cx = bullet.pos.x - bullet.speed.x;
                            let cy = bullet.pos.y - bullet.speed.y;
                            let testX = cx;
                            let testY = cy;

                            // which edge is closest?
                            if (cx < leftSide) {
                                testX = leftSide; // test left edge
                                sides.push('left');
                            } else if (cx > rightSide) {
                                testX = rightSide; // right edge
                                sides.push('right');
                            }
                            if (cy < topSide) {
                                testY = topSide; // top edge
                                sides.push('top');
                            } else if (cy > bottomSide) {
                                testY = bottomSide; // bottom edge
                                sides.push('bottom');
                            }
                            let distance = Math.sqrt(Math.pow(cx - testX, 2) + Math.pow(cy - testY, 2));
                            let bulletVector = { ...bullet.speed };
                            if (sides.length > 0) {
                                let scaleBV;
                                let bounceFric = 0.5;
                                switch (sides[random.int(0, sides.length - 1)]) {
                                    case "left":
                                        bullet.speed.x *= -bounceFric;
                                        scaleBV = distance / bulletVector.x;
                                        break;
                                    case "right":
                                        bullet.speed.x *= -bounceFric;
                                        scaleBV = distance / bulletVector.x;
                                        break;
                                    case "top":
                                        bullet.speed.y *= -bounceFric;
                                        scaleBV = distance / bulletVector.y;
                                        break;
                                    case "bottom":
                                        bullet.speed.y *= -bounceFric;
                                        scaleBV = distance / bulletVector.y;
                                        break;
                                }
                                bullet.pos.x = cx + bulletVector.x * Math.abs(scaleBV);
                                bullet.pos.y = cy + bulletVector.y * Math.abs(scaleBV);
                            } else {
                                bullet.delete = true;
                            }

                            break;
                    }
                }
            }
        }
    }
    let bag = gunner.bag;
    let holdingGun = bag.arr[bag.index];
    if (holdingGun.name != lastWeaponHolding) { // khi đổi vũ khí
        let lastIndexGun = bag.arr.findIndex(e => e.name == lastWeaponHolding);
        if (lastIndexGun != -1)
            bag.arr[lastIndexGun].isReloading = false;
        gunner.holdingCoolDown = BULLET_CONFIG[holdingGun.name].delayHold;
    }

    if (gunner.holdingCoolDown > 0)
        gunner.holdingCoolDown--;
    else { // khi cooldown đếm xong
        if (holdingGun.isReloading) {
            holdingGun.isReloading = false;
            holdingGun.bulletCount = BULLET_CONFIG[holdingGun.name].round;
            holdingGun.magazine--;
        } else {
            if (!holdingGun.isReloading && holdingGun.magazine > 0 && ((!gunner.firing && holdingGun.bulletCount <= 0) || gunner.keydown['r'])) { // nếu đang ở trang thái không bắn và hết đạn thì reload đạn
                holdingGun.isReloading = true;
                gunner.holdingCoolDown = BULLET_CONFIG[holdingGun.name].reload;
            }

            if (gunner.firing && holdingGun.bulletCount > 0 && !holdingGun.isReloading) { // cooldown đếm xong và đang ở trạng thái bắn với số đạn > 0
                gunner.holdingCoolDown = BULLET_CONFIG[holdingGun.name].delayFire;
                holdingCoolDownIsChanged = true;
                holdingGun.bulletCount--;
                let status = 'staying';
                if (checkMoving) {
                    status = 'moving';
                    if (gunner.keydown['shift'])
                        status = 'walking';
                }

                for (let i = 0; i < BULLET_CONFIG[holdingGun.name].split; i++) {
                    let noise = randomNormal({
                        mean: 0,
                        dev: Math.PI / 180 * (BULLET_CONFIG[holdingGun.name].dev[status] / 4)
                    });

                    let radian = degreesToRadians(gunner.degree);
                    let dx = Math.cos(radian); // default speed x, y for get starPos of bullet
                    let dy = Math.sin(radian);
                    let magDefault = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    let scaleDefault = 70 / magDefault;
                    let startPos = { // vị trí bắn ở đầu nhân vật
                        x: position.x + dx * scaleDefault,
                        y: position.y + dy * scaleDefault,
                    };

                    let radianSpeed = radian + noise;
                    let sx = Math.cos(radianSpeed); // nx means noised position x
                    let sy = Math.sin(radianSpeed);
                    let magSpeed = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
                    let scaleSpeed = BULLET_CONFIG[holdingGun.name].speed / magSpeed; // scale cho cái speed = bulletconfig>speed
                    let speed = { // vector speed đạn 
                        x: sx * scaleSpeed,
                        y: sy * scaleSpeed
                    };

                    let friction = BULLET_CONFIG[holdingGun.name].friction;

                    bullets.push({
                        owner: gunner.id,
                        name: holdingGun.name,
                        id: `${gunner.id}|${bulletID++}${((i > 0) ? '(split)': '')}`,
                        type: 'Bullet',
                        speed,
                        size: BULLET_CONFIG[holdingGun.name].size,
                        friction,
                        degree: radiansToDegrees(radianSpeed),
                        pos: startPos,
                        delete: false,
                        imgName: BULLET_CONFIG[holdingGun.name].imgName.toLowerCase()
                    });
                }
            }
        }
    }

    let addArr = [];
    let spliceArr = [];
    let normalArr = [...treesCollide];

    if (!checkMoving) { // khi đứng yên
        treesCollide.length = 0;
    }

    for (let i in treesCollide) { // list of new tree collide
        if (lastTreesCollide.indexOf(treesCollide[i]) == -1) {
            addArr.push(treesCollide[i]);
        }
    }

    for (let i in lastTreesCollide) { // list of old tree collide
        if (treesCollide.indexOf(lastTreesCollide[i]) == -1) {
            spliceArr.push(lastTreesCollide[i]);
        }
    }
    lastTreesCollide = [...treesCollide];
    lastWeaponHolding = holdingGun.name;

    parentPort.postMessage({
        name: 'response',
        position,
        bullets,
        blood,
        killedBy,
        deleteBullets,
        holdingCoolDown: gunner.holdingCoolDown,
        bagArr: gunner.bag.arr,
        treesCollide: {
            addArr,
            spliceArr,
            normalArr,
        },
    });
}, 30);