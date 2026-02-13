const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const nameInput = document.getElementById("name");

const socket = new WebSocket(`ws://${location.host}`);

socket.addEventListener("open", () => {
	log("[Connected]");
});

socket.addEventListener("message", (event) => {
	log(event.data);
});

socket.addEventListener("close", () => {
	log("[Disconnected]");
});

socket.addEventListener("error", (e) => {
	log("[Error connecting to server]");
});

nameInput.addEventListener("change", () => {
	const name = nameInput.value.trim();
	if (name) {
		socket.send(JSON.stringify({ type: "setName", name }));
	}
});

function sendMessage() {
	const text = input.value.trim();
	if (!text) return;

	socket.send(JSON.stringify({ type: "message", text }));
	input.value = "";
}

function log(text) {
	const div = document.createElement("div");
	div.textContent = text;
	chat.appendChild(div);
	chat.scrollTop = chat.scrollHeight;
}
