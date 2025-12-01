import { io } from "socket.io-client";

// 배포용 - Render 서버
// 배포용 - Render 서버
// export const API_URL = "https://bibe-coding.onrender.com";

// 로컬 개발용
export const API_URL = "http://localhost:3000";

export const socket = io(API_URL, {
  autoConnect: false
});
