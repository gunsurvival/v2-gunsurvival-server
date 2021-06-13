const imageDir = "images/";
const imagePaths = [
	"BoxEmty.png",
	"BoxNormal.png",
	"Door.png",
	"Gravel1.png",
	"Gravel2.png",
	"Gravel3.png",
	"Gunner.png",
	"Leaf1.png",
	"Leaf2.png",
	"Leaf3.png",
	"Rock.png",
	"RoofBrown.png",
	"Tree.png",
	"Bullet.png"
];

const GlobalAssets = {
	cursor: {
		default: "cursors/aim.cur"
	},
	images: {}
};

const loadAssets = async ({sketch, onProgress, onError, onDone}) => {
	let loadedCount = 0;
	let hasError = false;
	for (const path of imagePaths) {
		sketch.loadImage(
			imageDir + path,
			p5Image => {
				loadedCount++;
				onProgress && onProgress(loadedCount);
				GlobalAssets.images[path] = p5Image;

				if (loadedCount == imagePaths.length && !hasError)
					onDone && onDone(loadedCount);
			},
			error => {
				loadedCount++;
				onError && onError(error);
				if (loadedCount == imagePaths.length && !hasError)
					onDone && onDone(loadedCount);
			}
		);
	}
};

export default GlobalAssets;
export {GlobalAssets, loadAssets, imagePaths};
export const {cursors, images} = GlobalAssets;
