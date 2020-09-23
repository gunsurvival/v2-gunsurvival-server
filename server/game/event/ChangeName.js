import xssFilters from "xss-filters";

/**
 * Change the name of player
 * 
 * @memberof module:Event
 * @param  {GameServer} server - GameServer
 * @param  {Socket} socket - socket from event "connection" of io
 * @param  {Object} userData - Data emitted from the client-side
 * @param  {String} userData.name - Name of the player
 */
const ChangeName = (server, socket, {name} = {}) => {
	// check form
	name = xssFilters.inHTMLData(String(name));
	if (name.length < 3)
		return socket.emit("alert dialog", "Ten qua ngan!");
	socket.name = name;
	socket.emit("alert", {
		title: "Thanh cong",
		text: `Da doi ten thanh: ${name}!`,
		icon: "success"
	})
    const room = server.getRoomBySocketID(socket.id);
	if (!room)
		return;

	const player = room.playerManager.find({
		id: socket.id
	});
	if (player)
		player.name = name;
	// socket.emit("ChangeName", time);
};

export default ChangeName;
