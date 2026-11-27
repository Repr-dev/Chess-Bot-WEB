"use strict";
import { Chess } from "chess.js";

const chess = new Chess();

let evalEl = document.querySelector("#eval");
let depthEl = document.querySelector("#depth");
let bestMoveEl = document.querySelector("#best-move");
let showBestMoveBtn = document.querySelector("#show-best-move");
let botStatusEl = document.querySelector("#bot-status");
function updateBotStatus(waiting) {
    if (chess.isGameOver()) {
        botStatusEl.textContent = "GAME OVER";
        botStatusEl.classList = "game-over";

        showBestMoveBtn.style.display = "none";
        bestMoveEl.style.display = "inline";
        bestMoveEl.textContent = "-";
        return;
    }

    if (waiting) {
        botStatusEl.textContent = "Waiting for player";
        botStatusEl.classList = "waiting-for-player";
    }
    else {
        botStatusEl.textContent = "Calculating...";
        botStatusEl.classList = "calculating";

        showBestMoveBtn.style.display = "inline";
        bestMoveEl.style.display = "none";
    }
}
updateBotStatus(true);

// Moving pieces (non-socket-dependent)
let moveList = [];
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
function movePiece(piece, toSquare, enPassantSq = null, highlightToAndFromSquares = false) {
    let oldSquareCoords = piece.parentElement.id;
    let oldIndex = squareCoordsToIndex(oldSquareCoords);

    // Highlighting squares
    if (highlightToAndFromSquares) {
        let fromSquare = squares[oldIndex[0]][oldIndex[1]];
        fromSquare.classList.add("highlighted");
        toSquare.classList.add("highlighted");
    }

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
    if (
        piece.src.includes("wk") &&
        oldSquareCoords === "e1" &&
        toSquare.id === "g1"
    ) {
        movePiece(squareContents[7][7], squares[7][5]);
    } else if (
        piece.src.includes("bk") &&
        oldSquareCoords === "e8" &&
        toSquare.id === "g8"
    ) {
        movePiece(squareContents[0][7], squares[0][5]);
    } else if (
        piece.src.includes("wk") &&
        oldSquareCoords === "e1" &&
        toSquare.id === "c1"
    ) {
        movePiece(squareContents[7][0], squares[7][3]);
    } else if (
        piece.src.includes("bk") &&
        oldSquareCoords === "e8" &&
        toSquare.id === "c8"
    ) {
        movePiece(squareContents[0][0], squares[0][3]);
    }

    // Moving/deleting pieces
    let newIndex = squareCoordsToIndex(toSquare.id);
    squareContents[oldIndex[0]][oldIndex[1]] = null;
    if (squareContents[newIndex[0]][newIndex[1]] != null)
        squareContents[newIndex[0]][newIndex[1]].remove();
    if (enPassantSq != null) {
        let enPassantSqIndex = squareCoordsToIndex(enPassantSq);
        squareContents[enPassantSqIndex[0]][enPassantSqIndex[1]].remove();
    }
    squareContents[newIndex[0]][newIndex[1]] = piece;
}
function playSoundsForMove(move) {
    if (chess.inCheck()) new Audio("./assets/sounds/move-check.mp3").play();
    else if (move.isKingsideCastle() || move.isQueensideCastle()) new Audio("./assets/sounds/castle.mp3").play();
    else if (move.isPromotion()) new Audio("./assets/sounds/promote.mp3").play();
    else if (move.isCapture()) new Audio("./assets/sounds/capture.mp3").play();
    else new Audio("./assets/sounds/move-opponent.mp3").play();
    if (chess.isGameOver()) new Audio("./assets/sounds/game-end.mp3").play();
}

// Networking stuff
const socketLocation = `ws://${window.location.host}`;
const socket = new WebSocket(socketLocation);

socket.addEventListener("open", () => {
    console.log("Connected to server at " + socketLocation);
    socket.send("ucinewgame");
});

socket.addEventListener("message", e => {
    let data = e.data;
    if (data.includes("score ")) {
        let signInteger = chess.turn() === "w" ? 1 : -1;

        if (data.includes("score cp ")) {
            let scoreSplit = data.split("score cp ")[1]?.split(" ")[0];
            let score = Number(scoreSplit) * signInteger / 100;
            evalEl.textContent = score > 0 ? `+${score}` : score;
        }
        else if (data.includes("score mate ")) {
            evalEl.textContent = "mate in " + data.split("score mate ")[1]?.split(" ")[0];
        }
    }
    if (data.includes("depth ")) {
        depthEl.textContent = data.split("depth ")[1]?.split(" ")[0];
    }
    if (data.includes(" pv ")) {
        let pvMoves = data.split(" pv ")[1]?.split(/\s/gm);
        bestMoveEl.textContent = pvMoves.length > 1 ? pvMoves[1] : "-";
    }
    if (data.includes("bestmove")) {
        let epSquare = chess.fen().split(' ')[3];
        let moveInLan = data.split("bestmove ")[1]?.split(/\s/gm)[0];
        let move = chess.move(moveInLan);
        let fromIndex = squareCoordsToIndex(move.from);
        let toIndex = squareCoordsToIndex(move.to);
        moveList.push(moveInLan);
        movePiece(squareContents[fromIndex[0]][fromIndex[1]], squares[toIndex[0]][toIndex[1]], move.isEnPassant() ? epSquare : null, true);
        playSoundsForMove(move);
        updateBotStatus(true);

        if (chess.isGameOver()) {
            bestMoveEl.textContent = "-";
            depthEl.textContent = "-";

            if (chess.isCheckmate()) evalEl.textContent = chess.turn() === 'w' ? '0-1 (Black wins)' : '1-0 (White wins)';
            else if (chess.isStalemate()) evalEl.textContent = "½-½ (stalemate)";
            else if (chess.isThreefoldRepetition()) evalEl.textContent = "½-½ (draw; threefold repetition)";
            else if (chess.isDrawByFiftyMoves()) evalEl.textContent = "½-½ (draw; 50-move rule)";
            else if (chess.isInsufficientMaterial()) evalEl.textContent = "½-½ (draw; insufficient material)";

            document.querySelectorAll(".piece").forEach(el => {
                el.style.pointerEvents = "none";
            });
        }
    }

    console.log(data);
});

// Moving pieces (socket-dependent)
function clearHighlightedSquares() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (squares[i][j].classList.contains("highlighted")) squares[i][j].classList.remove("highlighted");
        }
    }
}
function sendMoveToBot(piece, toSquare) {
    let baseMessage = "position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 moves ";
    const movetime = 1500;

    moveList.push(piece.parentElement.id + toSquare.id);
    let writtenMoveList = moveList.join(" ");
    let message = baseMessage + writtenMoveList + "\n";

    socket.send(message);
    socket.send(`go movetime ${movetime}\n`);

    updateBotStatus(false);
}
Draggable.create(".human-piece", {
    type: "x,y",
    zIndexBoost: true,
    onPress: function (e) {
        gsap.to(this.target, {
            scale: 1.1,
            duration: 0.2,
            ease: "back.out",
            overwrite: "auto"
        });
    },
    onRelease: function (e) {
        gsap.to(this.target, {
            scale: 1,
            duration: 0.2,
            ease: "back.out",
            overwrite: "auto"
        });

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
            let epSquare = chess.fen().split(' ')[3];
            let move = chess.move({ from: this.target.parentElement.id, to: touchedSquare.id });
            playSoundsForMove(move);
            sendMoveToBot(this.target, touchedSquare);
            movePiece(this.target, touchedSquare, move.isEnPassant() ? epSquare : null);
            clearHighlightedSquares();
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
