const ChangeWeapon = (server, socket, {index} = {}) => {
	const room = server.getRoomBySocketID(socket.id);
	if (!room) return;

	const bag = socket.gunner.bag;
	index = parseInt(index);
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
