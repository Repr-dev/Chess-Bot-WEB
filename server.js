"use strict";
import { spawn } from "node:child_process";
import path from "node:path";

const options = {
    Threads: "2", // threads usable by the bot
    Ponder: "true", // Can the bot think while you play?
    OwnBook: "true", // Can the bot use an opening book?
    BookFile: "book.bin", // book path (relative to chessbot.exe)
    DefaultMoveTime: "2000" // (milliseconds) bot move time
};
const bot = spawn("chessbot.exe", { cwd: path.resolve(process.cwd(), "BOT") });

bot.stdin.write("uci\n");
bot.stdin.write("isready\n");
for (let [name, value] of Object.entries(options)) {
    bot.stdin.write(`setoption name ${name} value ${value}\n`);
}
bot.stdin.write("ucinewgame\n");

// Handle data sent by bot
bot.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
});
bot.stderr.on("data", data => {
    console.error(`stderr: ${data}`);
});
bot.on("close", code => {
    console.log(`child process exited with code ${code}`);
});
