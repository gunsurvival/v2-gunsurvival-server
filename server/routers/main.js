import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
	res.send(
		"Apache is functioning normally<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>đùa thôi :v server nodejs mà ;))"
	);
});

export default router;
