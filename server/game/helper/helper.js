const shuffle = function(arr) {
	// thuật toán bogo-sort
	let count = arr.length,
		temp,
		index;

	while (count > 0) {
		index = Math.floor(Math.random() * count);
		count--;
		temp = arr[count];
		arr[count] = arr[index];
		arr[index] = temp;
	}

	return arr; //Bogosort with no điều kiện dừng
};

const degreesToRadians = function(degrees) {
	return degrees * (Math.PI / 180);
};

const radiansToDegrees = function(radians) {
	return radians * (180 / Math.PI);
};

export {shuffle, degreesToRadians, radiansToDegrees};
