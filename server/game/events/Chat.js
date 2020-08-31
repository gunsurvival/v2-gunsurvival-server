import xssFilters from "xss-filters";

const Chat = (server, socket, {text} = {}) => {
	let room = server.getRoomBySocketID(socket.id);
	if (!room) return;

	if (text.length > 100) return;
	text = xssFilters.inHTMLData(text);
	room.addChat(text, socket);
};

export default Chat;
