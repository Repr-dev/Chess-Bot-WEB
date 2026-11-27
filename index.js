"use strict";

const humanColor = "w";

gsap.registerPlugin(Draggable);

// Particles
particlesJS.load("particles-js", "assets/particles.json");

// Chessboard initialization

// squares
let board = document.querySelector("#board");
let squares = [[], [], [], [], [], [], [], []];
function squareIndexToCoords(i, j) {
    return String.fromCharCode(97 + j) + (8 - i).toString();
}
function squareCoordsToIndex(coords) {
    let j = coords.charCodeAt(0) - 97;
    let i = 8 - coords[1];

    return [i, j];
}
for (let i = 0; i < 8; i++) {
    let rank = document.createElement("div");
    rank.classList.add("rank");
    rank.id = "rank-" + (8 - i);

    for (let j = 0; j < 8; j++) {
        let square = document.createElement("div");
        square.classList.add((i + j) % 2 === 0 ? "light-square" : "dark-square");
        square.id = squareIndexToCoords(i, j);

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
        if (humanColor === "w") piece.classList.add(i < 4 ? "bot-piece" : "human-piece");
        if (humanColor === "b") piece.classList.add(i < 4 ? "human-piece" : "bot-piece");
        piece.setAttribute("draggable", "false");
        piece.src = `assets/pieces/${pieceType}.svg`;
        squares[i][j].appendChild(piece);
        squareContents[i].push(piece);
    }
}

// Other
let bestMoveEl = document.querySelector("#best-move");
let showBestMoveBtn = document.querySelector("#show-best-move");
function showBestMove() {
    showBestMoveBtn.style.display = "none";
    bestMoveEl.style.display = "inline";
}
