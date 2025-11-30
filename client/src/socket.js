import { io } from "socket.io-client";

// 로컬 개발용
const URL = "http://localhost:3000";

// 배포용 (주석 처리)
// const URL = "https://bibe-coding.onrender.com";

export const socket = io(URL, {
  autoConnect: false
});
