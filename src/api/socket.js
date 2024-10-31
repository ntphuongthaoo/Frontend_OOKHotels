import { io } from "socket.io-client";

// Đường dẫn tới server backend
const socket = io("http://localhost:3000", {
  // Đảm bảo gửi token để xác thực khi kết nối
  auth: {
    token: localStorage.getItem("Token"), // Lấy token từ localStorage
  },
  transports: ["websocket"],
});

export default socket;
