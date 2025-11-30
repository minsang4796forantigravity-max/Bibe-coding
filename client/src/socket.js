import { io } from "socket.io-client";

// 배포용 - Render 서버
const URL = "https://bibe-coding.onrender.com";

// 로컬 개발용 (주석 처리)
// const URL = "http://localhost:3000";

export const socket = io(URL, {
  autoConnect: false
});
