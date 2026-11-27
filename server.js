"use strict";
import { spawn } from "node:child_process";
import express from "express";
import http from "node:http";
import { WebSocketServer } from "ws";
import path from "node:path";

//
// RUNNING THE BOT
//

const options = {
    Threads: "2", // threads usable by the bot
    Ponder: "true", // Can the bot think while you play?
    OwnBook: "true", // Can the bot use an opening book?
    BookFile: "book.bin", // book path (relative to chessbot.exe)
    DefaultMoveTime: "2000" // fallback for time-management bugs. Editing this does NOT edit movetime
};
const bot = spawn("chessbot.exe", { cwd: path.resolve(process.cwd(), "BOT") });

bot.stdin.write("uci\n");
bot.stdin.write("isready\n");
for (let [name, value] of Object.entries(options)) {
    bot.stdin.write(`setoption name ${name} value ${value}\n`);
}
bot.stdin.write("ucinewgame\n");

// Handle important (error/process stopping) messages from bot
bot.stderr.on("data", data => {
    console.error(`Bot stderr: ${data}`);
});
bot.on("close", code => {
    console.log(`child process exited with code ${code}`);
});

//
// SERVER / WEBSOCKETS
//

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
app.use(express.static(process.cwd(), { extensions: ['html'] }));

wss.on("connection", ws => {
    console.log("Connected to client!");

    ws.on("message", data => {
        const message = data.toString();

        // Forward to chess bot
        bot.stdin.write(`${message}\n`);
    });

    ws.on("close", () => {
        console.log("Client side has disconnected");
    });

    // Send bot output to frontend
    bot.stdout.on("data", data => {
        ws.send(data.toString("utf8"));
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
