/**
 * Re-emit rooms data to client
 *
 * @memberof module:Event
 * @param  {GameServer} server - GameServer
 * @param  {Socket} socket - socket from event "connection" of io
 */
const Refresh = (server, socket) => {
    const roomOptions = [];
    for (const room of server.roomManager.items) {
        roomOptions.push(room.getData());
    }

    socket.emit("updaterooms", roomOptions);
};

export default Refresh;