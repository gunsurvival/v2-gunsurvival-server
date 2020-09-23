/**
 * Change to another weapon
 * 
 * @memberof module:Event
 * @param  {GameServer} server - GameServer
 * @param  {Socket} socket - socket from event "connection" of io
 * @param  {Object} userData - Data emitted from the client-side
 * @param  {Number} userData.index - Index of item in player's bag
 */
const ChangeWeapon = (server, socket, {index} = {}) => {
	// check form
	index = parseInt(index);
	const room = server.getRoomBySocketID(socket.id);
	if (!room || isNaN(index)) return;

	const bag = socket.gunner.bag;
	if (index == bag.index) return;
	if (!isNaN(index) && index <= bag.arr.length - 1 && index >= 0) {
		// kiểm tra input của người dùng
		bag.index = index;
		bag.arr[bag.index].take();
	}

	room._io.to(room.id).emit("ChangeWeapon", {
		// thông báo tới room socket.id đã đổi vũ khí
		id: socket.id,
		gun: bag.arr[bag.index]
	});
};

export default ChangeWeapon;
