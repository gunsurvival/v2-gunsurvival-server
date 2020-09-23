/**
 * @module Helper
 */

/**
 * Shuffle the given array using bogo-sort
 * 
 * @param  {Array} arr - An array you want to shuffle
 * @return {Array} arr - A sorted array (dont need to re-assign)
 */
const shuffle = function(arr) {
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

	return arr;
};

/**
 * Convert degrees to radians
 * 
 * @param  {Number} degrees - The degrees number you want to convert into radians
 * @return {Number} radians
 */
const degreesToRadians = (degrees) => {
	return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 * 
 * @param  {Number} radians - The radians number you want to convert into degrees
 * @return {Number} degrees
 */
const radiansToDegrees = (radians) => {
	return radians * (180 / Math.PI);
};

export {shuffle, degreesToRadians, radiansToDegrees};
