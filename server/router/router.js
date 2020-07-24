import index from "./index.js";
import listimages from "./listimages.js";
import mapeditor from "./mapeditor.js";

const router = {
	"/": index,
	"/list-images": listimages,
	"/mapeditor": mapeditor
};

export default router;
