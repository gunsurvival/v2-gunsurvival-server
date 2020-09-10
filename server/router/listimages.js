import fs from "fs";
import path from "path";
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
	const listImages = [];
	const filenames = fs.readdirSync(path.join(__dirname, "../assets/img"));
	filenames.forEach(fileName => {
		if (/^(.*)-min\.png$/.test(fileName)) listImages.push(fileName);
	});
	res.send(listImages);
});

export default router;
