const Refresh = (server, socket) => {
    const roomOptions = [];
    for (const room of server.roomManager.items) {
        roomOptions.push(room.getData());
    }

    server._emitter.emit("updaterooms", roomOptions);
};

export default Refresh;