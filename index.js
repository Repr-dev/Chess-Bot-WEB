"use strict";

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
        piece.setAttribute("draggable", "false");
        piece.src = `assets/pieces/${pieceType}.svg`;
        squares[i][j].appendChild(piece);
        squareContents[i].push(piece);
    }
}

// // Moving pieces (non-socket-dependent)
// let moveList = [];
// function isMoveLegal(piece, toSquare) {
//     // does NOT take into account where a piece can see, blockers, etc.
//     return toSquare && toSquare != piece.parentElement && toSquare.children.length === 0;
// }
// function movePiece(piece, toSquare) {
//     let oldSquareCoords = piece.parentElement.id;
//     let oldIndex = squareCoordsToIndex(oldSquareCoords);

//     // Using FLIP to correctly offset the piece
//     if (isMoveLegal(piece, toSquare)) {
//         let oldRect = piece.getBoundingClientRect();

//         toSquare.appendChild(piece);
//         gsap.set(piece, { x: 0, y: 0 });
//         let newRect = piece.getBoundingClientRect();
//         gsap.set(piece, {
//             x: oldRect.left - newRect.left,
//             y: oldRect.top - newRect.top
//         });
//     }
//     gsap.to(piece, {
//         x: 0,
//         y: 0,
//         duration: 0.25,
//         ease: "power2.out",
//         overwrite: "auto"
//     });

//     // Castling
//     const isThereAFriendlyRookAt = (i, j) => {
//         let color = i === 7 ? "w" : "b";
//         if (squareContents[i][j] != null) {
//             let pieceType = squareContents[i][j].src;
//             if (pieceType.includes(color + "r")) return true;
//         } else return false;
//     };
//     if (
//         piece.src.includes("wk") &&
//         oldSquareCoords === "e1" &&
//         toSquare.id === "g1" &&
//         isThereAFriendlyRookAt(7, 7)
//     ) {
//         movePiece(squareContents[7][7], squares[7][5]);
//         console.log("wk g1");
//     } else if (
//         piece.src.includes("bk") &&
//         oldSquareCoords === "e8" &&
//         toSquare.id === "g8" &&
//         isThereAFriendlyRookAt(0, 7)
//     ) {
//         movePiece(squareContents[0][7], squares[0][5]);
//         console.log("bk g8");
//     } else if (
//         piece.src.includes("wk") &&
//         oldSquareCoords === "e1" &&
//         toSquare.id === "c1" &&
//         isThereAFriendlyRookAt(7, 0)
//     ) {
//         movePiece(squareContents[7][0], squares[7][3]);
//         console.log("wk c1");
//     } else if (
//         piece.src.includes("bk") &&
//         oldSquareCoords === "e8" &&
//         toSquare.id === "c8" &&
//         isThereAFriendlyRookAt(0, 0)
//     ) {
//         movePiece(squareContents[0][0], squares[0][3]);
//         console.log("bk c8");
//     }

//     let newIndex = squareCoordsToIndex(toSquare.id);
//     squareContents[oldIndex[0]][oldIndex[1]] = null;
//     squareContents[newIndex[0]][newIndex[1]] = piece;
// }

// // Networking stuff
// const socketLocation = `ws://${window.location.host}`;
// const socket = new WebSocket(socketLocation);

// let form = document.querySelector("#bot-input-form");
// let inputEl = document.querySelector("#bot-input");
// let outputEl = document.querySelector("#bot-output");

// form.addEventListener("submit", e => {
//     e.preventDefault();

//     let input = inputEl.value.trim();
//     if (input != "") {
//         // Send input to server
//         socket.send(input);
//     }

//     inputEl.value = "";
// });

// socket.addEventListener("open", () => {
//     console.log("Connected to server at " + socketLocation);
// });

// socket.addEventListener("message", e => {
//     let data = e.data;
//     if (data.includes("bestmove")) {
//         let moveInLan = data.split("bestmove ")[1]?.split("\n")[0];
//         moveList.push(moveInLan);
//         // make move
//     }

//     outputEl.textContent += data + "\n";
// });

// // Moving pieces (socket-dependent)
// function sendMoveToBot(piece, toSquare) {
//     let baseMessage = "position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 moves ";

//     moveList.push(piece.parentElement.id + toSquare.id);
//     let writtenMoveList = moveList.join(" ");
//     let message = baseMessage + writtenMoveList + "\n";

//     socket.send(message);
//     socket.send("go movetime 3000\n");
// }
// Draggable.create(".piece", {
//     type: "x,y",
//     zIndexBoost: true,
//     onRelease: function (e) {
//         // Find square being overlapped
//         let touchedSquare = null;
//         for (let i = 0; i < 8; i++) {
//             for (let j = 0; j < 8; j++) {
//                 let square = squares[i][j];
//                 let rect = square.getBoundingClientRect();
//                 let isTouching =
//                     e.clientX >= rect.left &&
//                     e.clientX <= rect.right &&
//                     e.clientY >= rect.top &&
//                     e.clientY <= rect.bottom;

//                 if (isTouching) {
//                     touchedSquare = square;
//                     break;
//                 }
//             }

//             if (touchedSquare) break;
//         }

//         if (isMoveLegal(this.target, touchedSquare)) {
//             sendMoveToBot(this.target, touchedSquare);
//             movePiece(this.target, touchedSquare);
//         } else
//             gsap.to(this.target, {
//                 x: 0,
//                 y: 0,
//                 duration: 0.25,
//                 ease: "power2.out",
//                 overwrite: "auto"
//             });
//     }
// });
