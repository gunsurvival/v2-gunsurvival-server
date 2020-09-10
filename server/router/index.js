import main from "./main.js"; // trang chu ("/")
import listimages from "./listimages.js";
import mapeditor from "./mapeditor.js";

const router = {
	"/": main,
	"/list-images": listimages,
	"/mapeditor": mapeditor
};

export default router;
