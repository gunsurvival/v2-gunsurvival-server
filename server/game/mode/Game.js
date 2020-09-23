import random from "random";
import * as Matter from "matter-js";
import Manager from "../helper/Manager.js";
import { SpriteClasses as Sprite } from "../sprite/"; // all sprite classes
import { Gun } from "../item/";
import { shuffle } from "../helper/helper.js";
import { items } from "../helper/helperConfig.js";

class Game {
    constructor({ _io, id, maxPlayer, frameTick = 30 } = {}) {
        this._io = _io;
        this.id = id;
        this.frameTick = frameTick;
        this.latency = 0;
        this.size = {
            width: 1500 + 400 * maxPlayer,
            height: 1000 + 300 * maxPlayer
        };
        this.spriteManager = new Manager();

        // this.allWeapons = "temp.json";
        this.interval; // interval varible
        //setting up world engine ....
        this.matterEngine = Matter.Engine.create();
        this.matterEngine.world.gravity = {
            x: 0,
            y: 0,
            scale: 0.001
        }
        this.addSprite(new Sprite.Score({
            value: 10,
            position: {
                x: 50,
                y: 50
            }
        }));
        this.addSprite(new Sprite.Score({
            value: 10,
            position: {
                x: 50,
                y: 50
            }
        }));
        this.addSprite(new Sprite.Score({
            value: 10,
            position: {
                x: 50,
                y: 50
            }
        }));
        this.addSprite(new Sprite.Score({
            value: 10,
            position: {
                x: 50,
                y: 50
            }
        }));
        this.addSprite(new Sprite.Score({
            value: 10,
            position: {
                x: 50,
                y: 50
            }
        }));
        this.createMap("random");
        // gravity: {
        //          x: 0,
        //          y: 1,
        //          scale: 0.001
        // },
        // for (let i = 0; i < 10; i++){
        //  objects.push(Matter.Bodies.rectangle(i*400, 200, 80, 80));
        // }
        // const boxB = Matter.Bodies.rectangle(450, 50, 80, 80);
        // const ground = Matter.Bodies.rectangle(400, 610, 810, 60, {
        //  isStatic: true
        // });
        // objects.push(ground);
    }

    addSprite(sprite) {
        this.spriteManager.add(sprite);
        Matter.World.add(this.matterEngine.world, sprite.matterBody);
    }

    deleteSprite(sprite) {
        this.spriteManager.delete(sprite);
        Matter.World.remove(this.matterEngine.world, sprite.matterBody);
    }

    updateRotate(sprite, rotate) {
        Matter.Body.set(sprite.matterBody, {
            angle: rotate
        });
    }

    getDeltaTime() {
        return 1000 / this.frameTick;
    }

    start() {
        let delay = 0;
        let stackDelay = 0;

        this.interval = setInterval(() => {
            let timeStart = Date.now();

            if (delay <= 0) {
                // not delaying the room
                const queueAddSprites = [];
                const queueDeleteSprites = [];
                for (const sprite of this.spriteManager.items) {
                    sprite.update(queueAddSprites);
                    if (sprite.deleted)
                        queueDeleteSprites.push(sprite);
                }
                // adding sprite after update state
                for (const sprite of queueAddSprites) {
                    this.addSprite(sprite);
                }
                // deleting sprite after update state
                for (const sprite of queueDeleteSprites) {
                    this.deleteSprite(sprite);
                }

                Matter.Engine.update(this.matterEngine, this.getDeltaTime());

                // counting the proccesing speed
                this.latency = Date.now() - timeStart;
                // console.log(this.latency + "ms!");
                if (this.latency > 30) {
                    // >30ms => room is not stable, lagging
                    delay = this.latency / 30; // add delay to stabilize the room
                    stackDelay += delay;
                    if (stackDelay > 100) {
                        // Phòng này lầy quá nên destroy :(
                        this._io.to(this.id).emit("alert dialog", "Phòng quá tải!");
                        this.destroy();
                    }
                } else {
                    stackDelay -= stackDelay > 0 ? 0.5 : 0;
                }
            } else {
                // Nếu room này đang lag thì phải vào hàng chờ, (nghi vấn phá server, spam)
                delay -= delay > 0 ? 1 : 0;
            }
            this.sendUpdates();
        }, this.getDeltaTime());
    }

    sendUpdates() {
        const updates = [];
        for (const sprite of this.spriteManager.items) {
            updates.push(sprite.getData());
        }
        // debugger;

        this._io.to(this.id).emit("updategame", updates);
    }

    createMap(mode, templateMap) {
        const mapSprite = ["Tree", "Rock"];
        switch (mode) {
            case "random":
                for (let i = 0; i <= this.size.width / 300; i++) {
                    const randomIndex = random.int(0, mapSprite.length - 1);
                    this.addSprite(new Sprite[mapSprite[randomIndex]]({
                        matterBodyOption: {
                            position: {
                                x: random.float(-this.size.width / 2, this.size.width / 2).toFixed(1) - 0,
                                y: random.float(-this.size.height / 2, this.size.height / 2).toFixed(1) - 0
                            }
                        }
                        // size: random.float(0.5, 1.5).toFixed(3) - 0, //add more size
                    }));
                }
                break;
            case "template":
                for (const spriteOption of templateMap) {
                    this.addSprite(new Sprite.Sprite(spriteOption));
                }
                break;
        }
    }

    addSpriteByName(spriteName, spriteConfig) {
        const sprite = new Sprite[spriteName](spriteConfig);
        Matter.World.add(this.matterEngine.world, sprite.matterBody);
    }

    addPlayer(player) {
        // them player vao room
        // shuffle(this.allWeapons);
        // let guns = [];
        // for (let i = 0; i < 2; i++) {
        //     if (i > this.allWeapons.length - 1) break;
        //     let gunConfig = this.allWeapons[i];
        //     gunConfig.ownerID = socket.id;
        //     guns.push(new Guns[items[gunConfig.name].class](gunConfig));
        // }

        const gunner = new Sprite.CounterTerrorist({
            id: player.id,
            playerName: player.name,
            matterBodyOption: {
                position: {
                    x: 0,
                    y: 0
                    // x: random.int(-this.size.width / 2, this.size.width / 2),
                    // y: random.int(-this.size.height / 2, this.size.height / 2)
                }
            }
            // bag: {
            //     arr: guns,
            //     index: 0
            // }
        });

        this.addSprite(gunner);
        return gunner;
    }

    destroy() {
        // xoa room
        clearInterval(this.interval);
        Matter.Engine.clear(this.matterEngine);
    }
}

export default Game;