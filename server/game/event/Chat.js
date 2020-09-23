import xssFilters from "xss-filters";

/**
 * Chatting
 * 
 * @memberof module:Event
 * @param  {GameServer} server - GameServer
 * @param  {Socket} socket - socket from event "connection" of io
 * @param  {Object} userData - Data emitted from the client-side
 * @param  {Number} userData.text - Content of the chat
 */
const Chat = (server, socket, {text} = {}) => {
	// check form
	text = String(text);
	const room = server.getRoomBySocketID(socket.id);
	if (!room || text.length > 100)
		return;
	if (!socket.lastChat)
		socket.lastChat = Date.now();
	if (
		text.length == 0 ||
		text.length > 50 ||
		Date.now() - socket.lastChat < 1000
	)
		return;
	socket.lastChat = Date.now();

	text = xssFilters.inHTMLData(text);
	room.addChat(text, socket);
};

export default Chat;
