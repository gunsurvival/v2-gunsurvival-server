const RoomJoin = (server, socket, {id} = {}) => {
	// check form
	id = String(id);
	const room = server.roomManager.find({id});
	if (!room)
		// khong tim thay phong
		return socket.emit("alert dialog", "Vui long thu lai sau , , ,");

	if (server.getRoomBySocketID(socket.id))
		return socket.emit("alert dialog", "Ban da tham gia phong khac roi!"); // neu da join roi thi huy bo
	room.socketJoin(socket)
		.then((player) => { // join xong se tra ve new Player()
			// this.game.addPlayer(player); // convert player to Gunner Sprite in world
			// socket.emit("static objects", this.game.staticObjects); // Gửi tọa độ các vật tĩnh
			room._io.to(room.id).emit("RoomJoin", player.getData());
			server._io.emit("updaterooms", room.getData()); // update room table
		})
		.catch(message => {
			console.log(message)
			socket.emit("alert dialog", message);
		});
};

export default RoomJoin;
