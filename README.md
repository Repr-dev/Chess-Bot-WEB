This is a chess GUI for the bot that I made. It works with any chess engine that uses a .exe and communicates over UCI (Universal Chess Interface).

Architecture:
**Chess Engine** (C++) ⇄ [UCI] ⇄ **Backend** (Node/ExpressJS) ⇄ [WebSockets] ⇄ **Frontend** (HTML/CSS/JS)

# How to Use
1. Run `npm install` in project root
2. Run `npm run start`
3. Open localhost:3000 in browser
