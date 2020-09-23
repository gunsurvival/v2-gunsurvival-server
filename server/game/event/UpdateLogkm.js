/**
 * Update the log of keyboard and mouse
 *
 * @memberof module:Event
 * @param  {Sprite} sprite - Sprite
 * @param  {Object} userData - Data emitted from the client-side
 * @param  {String} userData.method - Can be "keyboard" or "mouse"
 * @param  {?Number} userData.keyCode - Keycode if method is "keyboard"
 * @param  {?String} userData.mouseButton - Name of the mouse button ("left", "right" or "middle") if method is "mouse"
 * @param  {Boolean} userData.value - If (key, mouseButton) is ACTIVE(pushing down) then value will be TRUE, else FALSE (INACTIVE)
 */
const getLogkm = (sprite, userData) => {
    switch (userData.method) {
        case "keyboard":
            const keyCode = parseInt(userData.keyCode);
            if (keyCode)
                return sprite.logkmManager.find({ keyCode });
            break;
        case "mouse":
            const mouseButton = String(userData.mouseButton);
            if (mouseButton)
                return sprite.logkmManager.find({ mouseButton });
            break;
    }
}

/**
 * @param  {GameServer} server - GameServer
 * @param  {Socket} socket - socket from event "connection" of io
 * @param  {Object} userData - Data emitted from the client-side
 */
const UpdateLogkm = (server, socket, userData) => {
    const room = server.getRoomBySocketID(socket.id);
    if (!room) return;
    const sprite = room.game.spriteManager.find({ id: socket.id });
    if (!sprite) return;

    const logkm = getLogkm(sprite, userData);
    const value = Boolean(userData.value);

    if (logkm) {
        logkm.value = value; // value == true ---> pushing keyboard/mouse down || false ---> release keyboard/mouse up
    } else {
        sprite.logkmManager.add(userData);
    }

};

export default UpdateLogkm;