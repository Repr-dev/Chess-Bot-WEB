particlesJS.load("particles-js", "assets/particles.json");

const socketLocation = `ws://${window.location.host}`;
const socket = new WebSocket(socketLocation);

let form = document.querySelector("#bot-input-form");
let inputEl = document.querySelector("#bot-input");
let outputEl = document.querySelector("#bot-output");

form.addEventListener("submit", e => {
    e.preventDefault();

    let input = inputEl.value.trim();
    if (input != "") {
        // Send input to server
        socket.send(input);
    }

    inputEl.value = "";
});

socket.addEventListener("open", () => {
    console.log("Connected to server at " + socketLocation);
});

socket.addEventListener("message", e => {
    outputEl.textContent += e.data + "\n";
});
