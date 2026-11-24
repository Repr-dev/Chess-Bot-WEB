"use strict";

gsap.registerPlugin(Draggable);

// Particles
particlesJS.load("particles-js", "assets/particles.json");

// Chessboard initialization

// squares
let board = document.querySelector("#board");
let squares = [[], [], [], [], [], [], [], []];
for (let i = 0; i < 8; i++) {
    let rank = document.createElement("div");
    rank.classList.add("rank");
    rank.id = "rank-" + i;

    for (let j = 0; j < 8; j++) {
        let square = document.createElement("div");
        square.classList.add((i + j) % 2 === 0 ? "light-square" : "dark-square");
        square.id = String.fromCharCode(97 + j) + i.toString();
        rank.appendChild(square);
        squares[i].push(square);
    }

    board.appendChild(rank);
}

// pieces
const startingPosition = [
    ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
    ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
    [],
    [],
    [],
    [],
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"]
];
let squareContents = [[], [], [], [], [], [], [], []];
for (let i = 0; i < 8; i++) {
    if (startingPosition[i].length === 0) continue;

    for (let j = 0; j < 8; j++) {
        let pieceType = startingPosition[i][j];
        let piece = document.createElement("img");
        piece.classList.add("piece");
        piece.setAttribute("draggable", "false");
        piece.src = `assets/pieces/${pieceType}.svg`;
        squares[i][j].appendChild(piece);
        squareContents[i].push(piece);
    }
}

// Dragging pieces
Draggable.create(".piece", {
    type: "x,y",
    zIndexBoost: true,
    onRelease: function (e) {
        // Find square being overlapped
        let touchedSquare = null;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let square = squares[i][j];
                let rect = square.getBoundingClientRect();
                let isTouching =
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom;

                if (isTouching) {
                    touchedSquare = square;
                    break;
                }
            }

            if (touchedSquare) break;
        }

        let allowedToMoveSquare =
            touchedSquare &&
            touchedSquare != this.target.parentElement &&
            touchedSquare.children.length === 0;
        // Using FLIP to correctly offset piece if moved to a new square
        if (allowedToMoveSquare) {
            let oldRect = this.target.getBoundingClientRect();

            touchedSquare.appendChild(this.target);
            gsap.set(this.target, { x: 0, y: 0 });
            let newRect = this.target.getBoundingClientRect();
            gsap.set(this.target, {
                x: oldRect.left - newRect.left,
                y: oldRect.top - newRect.top
            });
        }

        gsap.to(this.target, {
            x: 0,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto"
        });
    }
});

// Networking stuff
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
