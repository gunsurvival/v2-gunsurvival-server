import express from "express";
const router = express.Router();

router.post("/", function(req, res) {
	let mapJSON;
	if (typeof req.body.map == "string") {
		try {
			mapJSON = JSON.parse(req.body.map);
			res.send({
				icon: "error",
				title: ":(",
				text: "ko đọc đc map"
			});
			console.log(mapJSON);
		} catch (e) {
			res.send({
				icon: "success",
				title: "K",
				text: "ok"
			});
		}
	}
});

export default router;
