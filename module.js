"use strict";
import { Chess } from "chess.js";

const chess = new Chess();

// Moving pieces (non-socket-dependent)
let moveList = [];
function squareIndexToCoords(i, j) {
    return String.fromCharCode(97 + j) + (8 - i).toString();
}
function squareCoordsToIndex(coords) {
    let j = coords.charCodeAt(0) - 97;
    let i = 8 - coords[1];

    return [i, j];
}
function isMoveLegal(piece, toSquare) {
    let moves = chess.moves({ verbose: true });
    for (let i = 0; i < moves.length; i++) {
        if (moves[i].from === piece.parentElement.id && moves[i].to === toSquare) {
            return true;
        }
    }

    return false;
}
function movePiece(piece, toSquare) {
    let oldSquareCoords = piece.parentElement.id;
    let oldIndex = squareCoordsToIndex(oldSquareCoords);

    // Using FLIP to correctly offset the piece
    let oldRect = piece.getBoundingClientRect();
    toSquare.appendChild(piece);
    gsap.set(piece, { x: 0, y: 0 });
    let newRect = piece.getBoundingClientRect();
    gsap.set(piece, {
        x: oldRect.left - newRect.left,
        y: oldRect.top - newRect.top
    });
    gsap.to(piece, {
        x: 0,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto"
    });

    // Castling
    const isThereAFriendlyRookAt = (i, j) => {
        let color = i === 7 ? "w" : "b";
        if (squareContents[i][j] != null) {
            let pieceType = squareContents[i][j].src;
            if (pieceType.includes(color + "r")) return true;
        } else return false;
    };
    if (
        piece.src.includes("wk") &&
        oldSquareCoords === "e1" &&
        toSquare.id === "g1" &&
        isThereAFriendlyRookAt(7, 7)
    ) {
        movePiece(squareContents[7][7], squares[7][5]);
    } else if (
        piece.src.includes("bk") &&
        oldSquareCoords === "e8" &&
        toSquare.id === "g8" &&
        isThereAFriendlyRookAt(0, 7)
    ) {
        movePiece(squareContents[0][7], squares[0][5]);
    } else if (
        piece.src.includes("wk") &&
        oldSquareCoords === "e1" &&
        toSquare.id === "c1" &&
        isThereAFriendlyRookAt(7, 0)
    ) {
        movePiece(squareContents[7][0], squares[7][3]);
    } else if (
        piece.src.includes("bk") &&
        oldSquareCoords === "e8" &&
        toSquare.id === "c8" &&
        isThereAFriendlyRookAt(0, 0)
    ) {
        movePiece(squareContents[0][0], squares[0][3]);
    }

    let newIndex = squareCoordsToIndex(toSquare.id);
    squareContents[oldIndex[0]][oldIndex[1]] = null;
    if (squareContents[newIndex[0]][newIndex[1]] != null)
        squareContents[newIndex[0]][newIndex[1]].remove();
    squareContents[newIndex[0]][newIndex[1]] = piece;
}

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
    socket.send("ucinewgame");
});

socket.addEventListener("message", e => {
    let data = e.data;
    if (data.includes("bestmove")) {
        let spaceSplit = data.split("bestmove ")[1]?.split(" ")[0];
        let newlineSplit = data.split("bestmove ")[1]?.split("\n")[0];
        let moveInLan = newlineSplit.length <= spaceSplit.length ? newlineSplit : spaceSplit;
        moveList.push(moveInLan);

        let move = chess.move(moveInLan);
        let fromIndex = squareCoordsToIndex(move.from);
        let toIndex = squareCoordsToIndex(move.to);
        movePiece(squareContents[fromIndex[0]][fromIndex[1]], squares[toIndex[0]][toIndex[1]]);

        if (chess.isGameOver()) {
            let reasoning = "no reason";
            if (chess.isCheckmate()) reasoning = "checkmate";
            else if (chess.isStalemate()) reasoning = "stalemate";
            else if (chess.isThreefoldRepetition()) reasoning = "draw by threefold repetition";
            else if (chess.isDrawByFiftyMoves()) reasoning = "draw by 50-move rule";
            else if (chess.isInsufficientMaterial()) reasoning = "draw by insufficient material";

            alert(`Game over! (${reasoning})\n\nRefresh the page to play a new game.`);
            document.querySelectorAll(".piece").forEach(el => {
                el.style.pointerEvents = "none";
            });
        }
    }

    outputEl.textContent += data + "\n";
    outputEl.scrollTop = outputEl.scrollHeight;
});

// Moving pieces (socket-dependent)
function sendMoveToBot(piece, toSquare) {
    let baseMessage = "position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 moves ";
    const movetime = 2000;

    moveList.push(piece.parentElement.id + toSquare.id);
    let writtenMoveList = moveList.join(" ");
    let message = baseMessage + writtenMoveList + "\n";

    socket.send(message);
    socket.send(`go movetime ${movetime}\n`);
}
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

        if (!chess.isGameOver() && isMoveLegal(this.target, touchedSquare.id)) {
            chess.move({ from: this.target.parentElement.id, to: touchedSquare.id });
            sendMoveToBot(this.target, touchedSquare);
            movePiece(this.target, touchedSquare);
        } else
            gsap.to(this.target, {
                x: 0,
                y: 0,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto"
            });
    }
});
