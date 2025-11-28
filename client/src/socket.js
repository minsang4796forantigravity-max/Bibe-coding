import { io } from "socket.io-client";

// 일단은 항상 배포된 서버만 쓰게 고정
const URL = "https://bibe-coding.onrender.com";

export const socket = io(URL, {
  autoConnect: false
});
