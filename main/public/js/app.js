import "./libs/jquery@3.6.0.min.js";
import "./libs/jquery@1.19.2.validate.min.js";
import "./libs/p5@1.3.1.min.js";
import "./libs/socket.io@4.0.1.min.js";
import "./libs/sweetalert2@11.js";
import "./libs/SAT@0.9.0.min.js";
// import "./libs/nanoid@3.1.22.browser.min.js";
import Renderer from "./Renderer.js";
import * as Room from "./rooms/index.js";

(() => {
	const urlParams = new URLSearchParams(window.location.search);
	const serverQuery = urlParams.get("server") || "local";
	let ip = "";

	switch (serverQuery) {
		case "heroku":
			ip = "http://gunsurvival2.herokuapp.com/";
			break;
		case "local":
			ip = "http://localhost:3000/";
			break;
		default:
			ip = !serverQuery.includes(":") ? serverQuery + ":3000" : serverQuery;
			break;
	}

	Sweetalert2.fire({
		title: `Hệ thống đang kết nối tới server ${serverQuery}`,
		text: "Vui lòng chờ . . .",
		showConfirmButton: false,
		allowOutsideClick: false,
		allowEscapeKey: true,
		didOpen: () => Sweetalert2.showLoading()
	});

	$(document).ready(() => {
		const socket = io(ip); // connect to server

		socket.on("connect", () => {
			// Sweetalert2.fire({
			// 	title: "Thành công!",
			// 	text: "Đã kết nối tới server!",
			// 	icon: "success",
			// 	allowOutsideClick: false,
			// 	allowEscapeKey: false
			// });
			socket.emit("lobby-join");
		});

		socket.on("lobby-join", () => {
			console.log(socket.id);
			Sweetalert2.close();
			new p5(function(sketch) {
				const renderer = new Renderer();
				renderer.inject(sketch);
				renderer.add(new Room.Lobby({socket}));
				renderer.switchTo(0);

				socket.onAny(async (eventName, ...args) => {
					for (let i = 0; i < renderer.items.length; i++) {
						const cb = renderer.items[i]?.onMessageHandlers[eventName];
						try {
							if (cb) await cb(...args);
						} catch (e) {
							console.log(e);
						}
					}
				});
			});
		});

		socket.on("connect_error", error => {
			// disconnect or unknown server
			console.log(error);
			$("#exit").click();
			if ($(".Sweetalert22-icon-error").length > 0)
				// check exists
				return;
			Sweetalert2.fire({
				title: "Ooops!",
				text: "Có vẻ như server đã offline :(",
				icon: "error",
				// footer: '<a onclick="changeServer()" href="#">Bấm vào đây để đổi server</a>',
				allowOutsideClick: false,
				allowEscapeKey: false
			});
		});

		socket.on("alert dialog", text => {
			Sweetalert2.fire({
				icon: "error",
				title: "Oops...",
				text
			});
		});

		socket.on("alert toast", text => {
			Toast.fire({
				icon: "info",
				title: text
			});
		});

		socket.on("alert", Sweetalert2Option =>
			Sweetalert2.fire(Sweetalert2Option)
		);

		$("#wrap-game").bind("contextmenu", e => {
			return false; // disable context menu
		});

		$("#create").click(createRoom);

		$("#error").click(() => {
			// bug reporting
			Sweetalert2.fire({
				title: "Helo :3",
				text:
					"Nếu tìm thấy lỗi vui lòng chụp ảnh màn hình lỗi và gửi cho tui mau!!",
				icon: "info",
				showCancelButton: true,
				confirmButtonColor: "#3085d6",
				cancelButtonColor: "#d33",
				confirmButtonText: "Vào trang cá nhân của tác giả!"
			}).then(result => {
				if (result.value) {
					window.open("https://www.facebook.com/khoakomlem", "_blank");
				}
			});
		});

		$("#exit").click(() => {
			// exit game
			utils.hideGame(100, () => {
				utils.pauseGame();
				utils.resetGame();
			});
			socket.emit("RoomLeave");
			// $("body").css("overflow", "");
			// $("#respawn").hide();
		});

		$("#respawn").click(() => {
			// respawn function
			socket.emit("room respawn");
			$("#respawn").fadeOut(200);
		});

		$("#chat").keypress(e => {
			// chatting
			if (e.which == 13) {
				socket.emit("room chat", {
					text: $("#chat").val()
				});
				$("#chat").fadeOut(100);
				$("#chat").val("");
			}
		});

		$("#refresh").click(() => {
			// refresh room
			socket.emit("Refresh");
		});

		$("#rename").click(async () => {
			// change name
			const {value: name} = await Sweetalert2.fire({
				input: "text",
				inputAttributes: {
					autocapitalize: "on",
					maxlength: 20,
					placeholder: "Hãy nhập tên của bạn . . ."
				},
				showCancelButton: true,
				background: "url('../../img/menu-min.png')  no-repeat center center"
			});
			if (name) {
				socket.emit("ChangeName", {name});
			}
		});

		$("#page").click(() => {
			// link to KB2A PAGE
			window.open("https://www.facebook.com/KB2A.Team/", "_blank");
		});

		$(".column100").on("mouseover", () => {
			const table1 = $(this)
				.parent()
				.parent()
				.parent();
			const table2 = $(this)
				.parent()
				.parent();
			const verTable = $(table1).data("vertable") + "";
			const column = $(this).data("column") + "";

			$(table2)
				.find("." + column)
				.addClass("hov-column-" + verTable);
			$(table1)
				.find(".row100.head ." + column)
				.addClass("hov-column-head-" + verTable);
		});

		$(".column100").on("mouseout", () => {
			const table1 = $(this)
				.parent()
				.parent()
				.parent();
			const table2 = $(this)
				.parent()
				.parent();
			const verTable = $(table1).data("vertable") + "";
			const column = $(this).data("column") + "";

			$(table2)
				.find("." + column)
				.removeClass("hov-column-" + verTable);
			$(table1)
				.find(".row100.head ." + column)
				.removeClass("hov-column-head-" + verTable);
		});
		// end of jquery ready function
	});
	const utils = {};

	const showGame = (utils.showGame = (timer = 100, callback) => {
		$("#menu").fadeOut(timer, "", () => {
			if (callback) callback();
			$("#menu").hide();
			$("body").css("overflow", "hidden");
			$("#wrap-game").fadeIn(timer);
		});
	});

	const hideGame = (utils.hideGame = (timer = 100, callback) => {
		$("#wrap-game").fadeOut(timer, "", () => {
			if (callback) callback();
			$("#wrap-game").hide();
			$("body").css("overflow", "");
			$("#menu").fadeIn(500);
		});
	});

	const updateRoom = (utils.updateRoom = ({
		master,
		id,
		text,
		maxPlayer,
		timeCreate,
		playing
	} = {}) => {
		const thaotac =
			playing.length >= maxPlayer
				? "style='color: red; cursor:no-drop'>Fulled"
				: "style = 'color: green; cursor:pointer'>VÀO!!";
		const time = new Date(timeCreate);
		const datetime = `${time.getDate()}/${time.getMonth()} ${time.getHours()}:${time.getMinutes()}`;
		const htmlContent = // td
			`<td class="column100 column1" data-column="column1" >${master}</td>` +
			`<td class="column100 column2" data-column="column2">${id}</td>` +
			`<td class="column100 column3" data-column="column3">${text}</td>` +
			`<td class="column100 column4" data-column="column4">${playing.length}/${maxPlayer}</td>` +
			`<td class="column100 column5" data-column="column5">${datetime}</td>` +
			`<td class="column100 column6 noselect" data-column="column6" ${thaotac}</td>`;
		// check element exists
		if ($(`#${id}`).length > 0) {
			//is exists
			$(`#${id}`).html(htmlContent);
		} else {
			// is not exists
			$("#table").append(`<tr id = "${id}">${htmlContent}</tr>`);
			$(`#${id} > td:last`).click(() => {
				socket.emit("RoomJoin", {id});
			});
		}
	});

	const createRoom = (utils.createRoom = async () => {
		const modes = ["Creative", "King", "Pubg", "Csgo"];
		const htmlOptions = (() => {
			let output = "";
			for (const mode of modes) {
				output += `<option value="${mode}">${mode.toUpperCase()}</option>`;
			}
			return output;
		})();
		const {value: mode} = await Sweetalert2.fire({
			title: "Tạo Phòng",
			html: `<select id="mode" name="mode" class="Sweetalert22-input">${htmlOptions}</select>`,
			showCancelButton: true,
			background: "url('./images/avatarpage-min.png') no-repeat center center",
			preConfirm: () => {
				return $("#mode").val();
			}
		});
		// second dialog
		const optionSweetalert2s = {};
		optionSweetalert2s["Creative"] = optionSweetalert2s["King"] = () => {
			Sweetalert2.fire({
				title: "Tùy chọn game",
				html:
					"<form id='option_form'>" +
					"<label for='Sweetalert2-input1'>Nhập số lượng người chơi có thể vào</label>" +
					"<input placeholder='Max player' type='number' name='maxplayer' id='Sweetalert2-input1' class='Sweetalert22-input'>" +
					"<input placeholder='Dòng thông điệp' name='text' maxLength='30' id='Sweetalert2-input2' class='Sweetalert22-input'>" +
					"</form>",
				allowOutsideClick: false,
				showCancelButton: true,
				background: `url('${ip}img/avatarpage-min.png') no-repeat center center`,
				preConfirm: () => {
					$("#option_form").validate({
						rules: {
							maxplayer: {
								required: true,
								range: [5, 15]
							}
						},
						messages: {
							maxplayer: {
								required: "Bạn phải điền ô này",
								range: "5 đến 15 bruh"
							}
						}
					});
					if (!$("#option_form").valid()) return false;
					const option = {
						mode,
						maxPlayer: $("#option_form > input[name='maxplayer']").val(),
						text: $("#option_form > input[name='text']").val()
					};
					socket.emit("RoomCreate", option);
					Sweetalert2.showLoading();
				}
			});
		};
		if (optionSweetalert2s.hasOwnProperty(mode)) {
			optionSweetalert2s[mode]();
		}
	});
})();
