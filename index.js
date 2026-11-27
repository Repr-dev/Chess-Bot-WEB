"use strict";

gsap.registerPlugin(Draggable);

// Particles
particlesJS.load("particles-js", "assets/particles.json");

// Chessboard initialization

// transforforms coordinates when the board is flipped
const coordTransform = k => humanColor === "w" ? k : 7 - k;

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
    rank.id = "rank-" + (8 - coordTransform(i));

    for (let j = 0; j < 8; j++) {
        let square = document.createElement("div");
        square.classList.add((coordTransform(i) + coordTransform(j)) % 2 === 0 ? "light-square" : "dark-square");
        square.id = squareIndexToCoords(coordTransform(i), coordTransform(j));

        rank.appendChild(square);
        squares[coordTransform(i)][coordTransform(j)] = square;
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
    if (startingPosition[coordTransform(i)].length === 0) continue;

    for (let j = 0; j < 8; j++) {
        let pieceType = startingPosition[coordTransform(i)][coordTransform(j)];
        let piece = document.createElement("img");
        piece.classList.add("piece");
        if (humanColor === "w") piece.classList.add(coordTransform(i) < 4 ? "bot-piece" : "human-piece");
        else piece.classList.add(coordTransform(i) < 4 ? "human-piece" : "bot-piece");
        piece.setAttribute("draggable", "false");
        piece.src = `assets/pieces/${pieceType}.svg`;

        squares[coordTransform(i)][coordTransform(j)].appendChild(piece);
        squareContents[coordTransform(i)][coordTransform(j)] = piece;
    }
}

// Other
let bestMoveEl = document.querySelector("#best-move");
let showBestMoveBtn = document.querySelector("#show-best-move");
function showBestMove() {
    showBestMoveBtn.style.display = "none";
    bestMoveEl.style.display = "inline";
}
