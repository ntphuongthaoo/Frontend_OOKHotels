<template>
  <div class="profile-page">
    <h1>Thông tin cá nhân</h1>
    <div class="profile-container">
      <div v-if="userInfo" class="account-status">
        <p>
          <span
            :class="{
              activated: userInfo.IS_ACTIVATED,
              deactivated: !userInfo.IS_ACTIVATED,
            }"
          >
            {{ userInfo.IS_ACTIVATED ? "Đã kích hoạt" : "Chưa kích hoạt" }}
          </span>
        </p>
      </div>
      <!-- Form hiển thị thông tin người dùng -->
      <div class="user-info">
        <div class="form-group">
          <label>Họ và tên:</label>
          <input
            type="text"
            v-model="formData.FULLNAME"
            :readonly="!isEditing"
          />
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input type="email" v-model="formData.EMAIL" :readonly="!isEditing" />
        </div>

        <div class="form-group">
          <label>Số điện thoại:</label>
          <input
            type="text"
            v-model="formData.PHONE_NUMBER"
            :readonly="!isEditing"
          />
        </div>

        <!-- Các nút chỉnh sửa và lưu -->
        <div class="action-buttons">
          <button v-if="!isEditing" @click="toggleEdit" class="edit-btn">
            Chỉnh sửa
          </button>
          <button v-if="isEditing" @click="saveChanges" class="save-btn">
            Lưu thay đổi
          </button>
          <button v-if="isEditing" @click="cancelEdit" class="cancel-btn">
            Hủy bỏ
          </button>
        </div>
      </div>

      <!-- Form xác thực OTP -->
      <div v-if="showOtpForm" class="otp-verification">
        <h2>Xác thực Email</h2>
        <div class="form-group">
          <label>Nhập mã OTP:</label>
          <input type="text" v-model="otpCode" placeholder="Nhập mã OTP" />
        </div>
        <button @click="verifyOtp" class="verify-btn">Xác thực</button>
        <button @click="cancelOtp" class="cancel-btn">Hủy bỏ</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "../../api/axiosClient";
import { message } from "ant-design-vue";

export default {
  name: "Profile",
  data() {
    return {
      isEditing: false,
      showOtpForm: false, // Kiểm soát hiển thị form OTP
      otpCode: "", // Mã OTP nhập từ người dùng
      formData: {
        FULLNAME: "",
        EMAIL: "",
        PHONE_NUMBER: "",
      },
      originalData: {}, // Lưu thông tin gốc của người dùng để so sánh
      updatedEmail: "", // Lưu email mới để xác thực
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
  },
  methods: {
    toggleEdit() {
      this.isEditing = true;
      this.formData = { ...this.userInfo };
      this.originalData = { ...this.userInfo };
    },

    cancelEdit() {
      this.isEditing = false;
      this.formData = { ...this.originalData };
    },

    async saveChanges() {
      const updatedData = {};

      if (this.formData.FULLNAME !== this.originalData.FULLNAME) {
        updatedData.FULLNAME = this.formData.FULLNAME;
      }
      if (this.formData.EMAIL !== this.originalData.EMAIL) {
        updatedData.EMAIL = this.formData.EMAIL;
        this.updatedEmail = this.formData.EMAIL; // Lưu email để xác thực
      }
      if (this.formData.PHONE_NUMBER !== this.originalData.PHONE_NUMBER) {
        updatedData.PHONE_NUMBER = this.formData.PHONE_NUMBER;
      }

      if (Object.keys(updatedData).length === 0) {
        message.info("Không có thay đổi nào được thực hiện.");
        this.isEditing = false;
        return;
      }

      try {
        const response = await axios.put("/users/updateUser", updatedData);

        if (response.data.success) {
          if (updatedData.EMAIL) {
            this.showOtpForm = true;
            // Đặt trạng thái tài khoản là chưa kích hoạt
            this.$store.commit("SET_USER_INFO", {
              ...this.userInfo,
              IS_ACTIVATED: false,
              EMAIL: this.updatedEmail,
            });
            message.info(
              "Email đã được cập nhật. Vui lòng kiểm tra email để xác thực tài khoản."
            );
          } else {
            message.success("Cập nhật thông tin thành công!");
            this.$store.commit("SET_USER_INFO", {
              ...this.userInfo,
              ...updatedData,
            });
            this.isEditing = false;
          }
        } else {
          message.error("Đã xảy ra lỗi khi cập nhật thông tin.");
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật thông tin người dùng:", error);
        message.error("Đã xảy ra lỗi khi cập nhật thông tin.");
      }
    },

    // Xác thực OTP
    async verifyOtp() {
      try {
        const response = await axios.post("/users/verifyOTPAndActivateUser", {
          email: this.updatedEmail,
          otp: this.otpCode,
        });

        if (response.data.success) {
          message.success("Xác thực email thành công!");

          // Cập nhật trạng thái tài khoản là "Đã kích hoạt"
          this.$store.commit("SET_USER_INFO", {
            ...this.userInfo,
            IS_ACTIVATED: true, // Đặt lại thành "Đã kích hoạt"
            EMAIL: this.updatedEmail,
          });

          this.showOtpForm = false;
          this.isEditing = false;
        } else {
          const errorMsg =
            response.data.errors?.otp || "Mã OTP không chính xác.";
          message.error(errorMsg);
        }
      } catch (error) {
        console.error("Lỗi khi xác thực OTP:", error);
        const errorMsg =
          error.response?.data?.errors?.otp ||
          "Đã xảy ra lỗi khi xác thực mã OTP.";
        message.error(errorMsg);
      }
    },

    cancelOtp() {
      this.showOtpForm = false;
      this.otpCode = "";
      this.formData.EMAIL = this.originalData.EMAIL; // Khôi phục email gốc
      this.isEditing = false;
    },
  },
  mounted() {
    if (this.userInfo) {
      this.formData = { ...this.userInfo };
    }
  },
};
</script>

<style scoped>
/* CSS cho trang Profile */
.profile-page {
  max-width: 800px;
  margin: 40px auto;
  padding: 40px;
  background-color: #f8f1e7;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #6d4c41;
  text-align: center;
}

p {
  margin-bottom: 0px;
}

.account-status {
  font-size: 1.1rem;
  display: flex;
  justify-content: flex-end;
}

.account-status .activated {
  color: green;
  font-weight: bold;
}

.account-status .deactivated {
  color: red;
  font-weight: bold;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-info,
.otp-verification {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 1rem;
  color: #6d4c41;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input[readonly] {
  background-color: #f4f4f4;
}

.action-buttons,
.otp-verification {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.edit-btn,
.save-btn,
.cancel-btn,
.verify-btn {
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background-color: #6d4c41;
  color: #fff;
}

.save-btn {
  background-color: #4caf50;
  color: #fff;
}

.cancel-btn {
  background-color: #f44336;
  color: #fff;
}

.verify-btn {
  background-color: #2196f3;
  color: #fff;
}

.edit-btn:hover,
.save-btn:hover,
.cancel-btn:hover,
.verify-btn:hover {
  opacity: 0.8;
}
</style>
