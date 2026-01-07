import { io } from "socket.io-client";

// 배포용 - Render 서버
// detect if we are running on localhost
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = isLocalhost ? "http://localhost:3000" : "https://bibe-coding.onrender.com";

export const socket = io(API_URL, {
  autoConnect: false
});
