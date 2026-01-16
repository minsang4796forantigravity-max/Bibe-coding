
import { io } from "socket.io-client";

const URL = "http://localhost:3000";
const socket1 = io(URL);
const socket2 = io(URL);

let s1Connected = false;
let s2Connected = false;
let joinAttempted = false;

socket1.on("connect", () => {
    console.log("Socket 1 connected:", socket1.id);
    s1Connected = true;
    attemptJoin();
});

socket2.on("connect", () => {
    console.log("Socket 2 connected:", socket2.id);
    s2Connected = true;
    attemptJoin();
});

function attemptJoin() {
    if (s1Connected && s2Connected && !joinAttempted) {
        joinAttempted = true;
        console.log("Both connected. Joining game 'testroom1'...");

        // Mimicking client payload
        socket1.emit("join_game", { roomId: "testroom2", username: "Player1" });
        socket2.emit("join_game", { roomId: "testroom2", username: "Player2" });
    }
}

socket1.on("game_start", (data) => {
    console.log("✅ Socket 1 Game Start!", data.gameId);
});

socket2.on("game_start", (data) => {
    console.log("✅ Socket 2 Game Start!", data.gameId);
});

socket1.on("game_update", (state) => {
    if (Math.random() < 0.1) console.log("Socket 1 Update:", state.isStarted, state.matchTime);
});
socket2.on("game_update", (state) => { });


// Keep alive for a bit
setTimeout(() => {
    console.log("Test finished.");
    socket1.close();
    socket2.close();
}, 5000);
