const Config = {
	"ITEM_CONFIG": {
		"ak47": {
			"imgName": "bullet",
			"size": 0.4,
			"split": 1,
			"hold": 20,
			"fire": 4,
			"speed": 150,
			"friction": 0.93,
			"dev": {
				"running": 35,
				"walking": 20,
				"staying": 10
			},
			"round": 30,
			"reload": 45,
			"weight": 1,
			"class": "Automatic"
		},
		"m4a1": {
			"imgName": "bullet",
			"size": 0.85,
			"split": 1,
			"hold": 20,
			"fire": 4,
			"speed": 130,
			"friction": 0.93,
			"dev": {
				"running": 30,
				"walking": 15,
				"staying": 7
			},
			"round": 30,
			"reload": 50,
			"weight": 1.2,
			"class": "Automatic"
		},
		"awp": {
			"imgName": "bullet",
			"size": 1,
			"split": 1,
			"hold": 50,
			"fire": 50,
			"speed": 250,
			"friction": 0.93,
			"dev": {
				"running": 30,
				"walking": 10,
				"staying": 1
			},
			"round": 5,
			"reload": 110,
			"weight": 3.7,
			"class": "Automatic"
		},
		"paint": {
			"imgName": "paint-bullet",
			"size": 1.7,
			"split": 1,
			"hold": 20,
			"fire": 10,
			"speed": 100,
			"friction": 0.87,
			"dev": {
				"running": 30,
				"walking": 20,
				"staying": 15
			},
			"round": 15,
			"reload": 60,
			"weight": 2,
			"class": "Automatic"
		},
		"shotgun": {
			"imgName": "bullet",
			"size": 0.35,
			"split": 6,
			"hold": 20,
			"fire": 18,
			"speed": 140,
			"friction": 0.85,
			"dev": {
				"running": 25,
				"walking": 20,
				"staying": 15
			},
			"round": 5,
			"reload": 70,
			"weight": 2.2,
			"class": "Automatic"
		},
		"chicken": {
			"imgName": "egg",
			"size": 1,
			"split": 1,
			"hold": 30,
			"fire": 7,
			"speed": 120,
			"friction": 0.8,
			"dev": {
				"running": 30,
				"walking": 25,
				"staying": 20
			},
			"round": 100,
			"reload": 10,
			"weight": 1.5,
			"class": "Automatic"
		},
		"gatlin": {
			"imgName": "bullet",
			"size": 0.8,
			"split": 1,
			"hold": 80,
			"fire": 3,
			"speed": 150,
			"friction": 0.91,
			"dev": {
				"running": 45,
				"walking": 30,
				"staying": 20
			},
			"round": 200,
			"reload": 200,
			"weight": 4,
			"class": "Automatic"
		},
		"rpk": {
			"imgName": "bullet",
			"size": 0.85,
			"split": 1,
			"hold": 30,
			"fire": 4,
			"speed": 140,
			"friction": 0.92,
			"dev": {
				"running": 36,
				"walking": 30,
				"staying": 25
			},
			"round": 80,
			"reload": 40,
			"weight": 2.3,
			"class": "Automatic"
		},
		"uzi": {
			"imgName": "smg-bullet",
			"size": 0.6,
			"split": 1,
			"hold": 20,
			"fire": 2,
			"speed": 100,
			"friction": 0.89,
			"dev": {
				"running": 25,
				"walking": 20,
				"staying": 15
			},
			"round": 25,
			"reload": 35,
			"weight": 0.5,
			"class": "Automatic"
		},
		"revolver": {
			"imgName": "bullet",
			"size": 0.9,
			"split": 1,
			"hold": 30,
			"fire": 17,
			"speed": 130,
			"friction": 0.89,
			"dev": {
				"running": 20,
				"walking": 15,
				"staying": 10
			},
			"round": 8,
			"reload": 40,
			"weight": 0,
			"class": "Automatic"
		},
		"p90": {
			"imgName": "smg-bullet",
			"size": 0.6,
			"split": 1,
			"hold": 25,
			"fire": 3,
			"speed": 110,
			"friction": 0.89,
			"dev": {
				"running": 21,
				"walking": 18,
				"staying": 12
			},
			"round": 50,
			"reload": 45,
			"weight": 1,
			"class": "Automatic"
		},
		"rpg": {
			"imgName": "rocket",
			"size": 1,
			"split": 1,
			"hold": 50,
			"fire": 35,
			"speed": 70,
			"friction": 0.97,
			"dev": {
				"running": 15,
				"walking": 10,
				"staying": 5
			},
			"round": 50,
			"reload": 45,
			"weight": 3,
			"class": "Automatic"
		}
	},


	"REAL_SIZE": {
		"Rock": 200,
		"Tree": 190,
		"bullet": 10,
		"egg": 22,
		"paint-bullet": 22,
		"smg-bullet": 10,
		"rocket": 28,
		"Gunner": 80,
		"Box_emty": {
			"width": 144,
			"height": 143
		},
		"Box_wooden": {
			"width": 144,
			"height": 143
		},
		"Roof_brown": {
			"width": 833,
			"height": 434
		}
	},


	"MINUS_SIZE": {
		"Rock": 30,
		"Tree": 120,
		"bullet": 2,
		"egg": 2,
		"paint-bullet": 2,
		"smg-bullet": 2,
		"rocket": 2,
		"Gunner": 10,
		"Box_emty": {
			"width": 10,
			"height": 10
		},
		"Box_wooden": {
			"width": 10,
			"height": 10
		},
		"Roof_brown": {
			"width": 20,
			"height": 20
		}
	},

	"KEY_CONFIG": {
		"up": "w",
		"down": "s",
		"left": "a",
		"right": "d"
	}
};

module.exports = Config;
