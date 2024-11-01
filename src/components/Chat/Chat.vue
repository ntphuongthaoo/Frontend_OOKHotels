<template>
  <div class="chat-container">
    <!-- Danh sách người dùng (chỉ dành cho nhân viên và admin) -->
    <div v-if="isAdminOrStaff" class="users-list">
      <h3>Danh sách người dùng</h3>
      <div
        v-for="user in users"
        :key="user._id"
        class="user-item"
        @click="selectReceiver(user)"
      >
        <span v-if="user.hasNewMessage" class="notification-dot"></span>
        {{ user.FULLNAME }}
      </div>
    </div>

    <!-- Tin nhắn -->
    <div class="chat-content">
      <!-- Tin nhắn -->
      <div class="chat-messages" ref="messageContainer">
        <!-- Hiển thị thông báo nếu chưa chọn người dùng cho admin/staff -->
        <div v-if="isAdminOrStaff && !receiverId" class="select-user-prompt">
          Vui lòng chọn người dùng để bắt đầu trò chuyện.
        </div>
        <!-- Hiển thị tin nhắn nếu đã chọn người dùng -->
        <div v-else>
          <div v-for="(message, index) in messages" :key="index">
            <span class="sender">{{ message.sender }}:</span>
            <span class="content">{{ message.content }}</span>
            <span class="timestamp">{{ formatTime(message.createdAt) }}</span>
          </div>
        </div>
      </div>
      <!-- Input tin nhắn -->
      <div class="chat-input">
        <input
          type="text"
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Nhập tin nhắn..."
          :disabled="isAdminOrStaff && !receiverId"
        />
        <button @click="sendMessage" :disabled="isAdminOrStaff && !receiverId">
          Gửi
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import { mapState } from "vuex";
import axiosClient from "../../api/axiosClient";

export default {
  data() {
    return {
      socket: null,
      messages: [],
      newMessage: "",
      receiverId: "", // ID của người nhận
      users: [], // Danh sách người dùng
      defaultAdminId: "", // ID admin mặc định cho người dùng thường
    };
  },
  computed: {
    ...mapState(["userInfo"]), // Lấy thông tin người dùng từ Vuex

    // Kiểm tra xem tài khoản là admin hoặc nhân viên
    isAdminOrStaff() {
      return this.userInfo?.ROLE?.ADMIN || this.userInfo?.ROLE?.STAFF;
    },

    // Thuộc tính tính toán cho userId
    userId() {
      return this.userInfo ? this.userInfo._id : null;
    },
  },
  watch: {
    userId(newVal) {
      if (newVal) {
        this.initializeChat();
      }
    },
  },
  mounted() {
    if (this.userId) {
      this.initializeChat();
    }
    this.$nextTick(() => {
      this.scrollToBottom();
    });
  },
  methods: {
    scrollToBottom() {
      const container = this.$refs.messageContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    initializeChat() {
      // Kết nối với Socket.IO
      this.socket = io("http://localhost:3000", {
        auth: {
          token: localStorage.getItem("accessToken"),
        },
      });

      // Tham gia phòng chat với userId
      this.socket.emit("join", this.userId);

      // Lắng nghe sự kiện nhận tin nhắn từ server
      this.socket.on("receiveMessage", (message) => {
        // Thêm tin nhắn vào giao diện khi nhận từ server
        this.messages.push({
          sender: message.senderName || "ETHEREAL", // Dùng "ETHEREAL" nếu tên chưa được xác định
          content: message.content,
          createdAt: message.createdAt,
          senderId: message.senderId,
        });
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      // Tải tin nhắn cũ
      if (this.isAdminOrStaff) {
        this.fetchUsers();
        // Không gọi fetchMessages() ở đây vì cần receiverId
      } else {
        // Đặt ID admin mặc định nếu người dùng là user thường
        this.setDefaultAdminId().then(() => {
          if (this.defaultAdminId) {
            this.receiverId = this.defaultAdminId;
            this.fetchMessages();
          } else {
            console.error("defaultAdminId không được thiết lập.");
          }
        });
      }
    },

    sendMessage() {
      if (this.newMessage.trim() === "") return;

      if (this.isAdminOrStaff && !this.receiverId) {
        alert("Vui lòng chọn người dùng để nhắn tin.");
        return;
      }

      if (!this.isAdminOrStaff && !this.defaultAdminId) {
        alert("Không tìm thấy admin để gửi tin nhắn.");
        return;
      }

      const message = {
        senderId: this.userId,
        receiverId: this.isAdminOrStaff ? this.receiverId : this.defaultAdminId,
        content: this.newMessage,
        senderName: this.userInfo.FULLNAME || "ETHEREAL",
      };

      // Gửi tin nhắn lên server
      this.socket.emit("sendMessage", message);

      // Xóa nội dung tin nhắn sau khi gửi
      this.newMessage = "";
    },

    async fetchUsers() {
      try {
        const response = await axiosClient.get("/users/getUsers", {
          params: { tabStatus: 2, page: 1, limit: 10 },
        });

        console.log("Danh sách người dùng:", response.data.data); // Thêm log để kiểm tra dữ liệu

        // Lọc bỏ người dùng hiện tại khỏi danh sách
        this.users = response.data.data
          .filter((user) => user._id !== this.userId)
          .map((user) => ({ ...user, hasNewMessage: false }));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    },

    async setDefaultAdminId() {
      try {
        // Sử dụng API lấy danh sách người dùng và tìm admin
        const response = await axiosClient.get("/users/getUsers", {
          params: { tabStatus: 2, page: 1, limit: 10 },
        });

        console.log("Danh sách người dùng để tìm admin:", response.data.data); // Thêm log để kiểm tra dữ liệu

        // Tìm admin trong danh sách người dùng
        const admins = response.data.data.filter((user) => user.ROLE.ADMIN);

        if (admins.length > 0) {
          this.defaultAdminId = admins[0]._id;
          console.log("defaultAdminId được thiết lập:", this.defaultAdminId); // Log ID admin
        } else {
          console.error("Không tìm thấy admin nào.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy ID admin:", error);
      }
    },

    async fetchMessages() {
      if (!this.userId || !this.receiverId) {
        return;
      }

      try {
        const response = await axiosClient.get(
          `/messages/${this.userId}/${this.receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          this.messages = response.data.map((message) => ({
            sender: message.senderName,
            content: message.content,
            createdAt: message.createdAt, // Thêm thời gian
          }));
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } else {
          console.error("Dữ liệu trả về không phải là mảng tin nhắn.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    },

    selectReceiver(user) {
      if (!this.isAdminOrStaff) return;

      // Xóa chấm đỏ khi chọn người nhận
      user.hasNewMessage = false;

      this.receiverId = user._id;
      this.fetchMessages();
    },

    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }); // Định dạng thời gian
    },

    updateUserNotification(senderId) {
      const user = this.users.find((user) => user._id === senderId);
      if (user) {
        user.hasNewMessage = true; // Cập nhật chấm đỏ
      }
    },
  },
  beforeDestroy() {
    if (this.socket) this.socket.disconnect();
  },
};
</script>

<style scoped>
/* Overlay for the chat modal */
.chat-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Main content area of the chat modal */
.chat-modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 80vh; /* Prevents overflow beyond screen height */
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.chat-container {
  display: flex;
  height: 80vh; /* Đặt chiều cao tùy ý cho khung chat */
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

/* User list (only visible to admin/staff) */
.users-list {
  background-color: #f9f9f9;
  padding: 10px;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.chat-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Chiếm phần còn lại của chiều rộng */
  background-color: #ffffff;
}

.user-item {
  cursor: pointer;
  padding: 5px;
  border: 1px solid #7274ff;
  border-radius: 4px;
  margin-bottom: 5px;
  background-color: #e3f2fd;
  position: relative;
}

.notification-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 50%;
}

/* Message area */
.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding-left: 10px;
  padding-top: 10px;
  background-color: #ffffff;
  /* max-height: calc(80vh - 120px); 
  border: 1px solid #ccc; */
}

/* Message styles for sent and received messages */
.message {
  max-width: 60%;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  clear: both;
  position: relative;
}

/* Sent messages align right */
.message.sent {
  background-color: #7274ff;
  align-self: flex-end;
  margin-left: auto;
  text-align: right;
}

/* Received messages align left */
.message.received {
  background-color: #f1f1f1;
  align-self: flex-start;
  margin-right: auto;
  text-align: left;
}

/* Sender and timestamp styling */
.sender {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.timestamp {
  font-size: 0.75em;
  color: gray;
  display: block;
  margin-top: 5px;
}

/* Chat input area */
.chat-input {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ddd;
  position: sticky;
  bottom: 0;
  width: 100%;
}

.chat-input input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 5px;
}

.chat-input button {
  padding: 8px 12px;
  background-color: #7274ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-input button:hover {
  background-color: #5a5fc4;
}
</style>
