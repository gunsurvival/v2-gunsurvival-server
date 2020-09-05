import xssFilters from "xss-filters";

const Chat = (server, socket, {text} = {}) => {
	// check form
	text = String(text);
	const room = server.getRoomBySocketID(socket.id);
	if (!room || text.length > 100)
		return;

	text = xssFilters.inHTMLData(text);
	room.addChat(text, socket);
};

export default Chat;
