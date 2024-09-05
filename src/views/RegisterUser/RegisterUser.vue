<template>
  <div class="signup-page">
    <main>
      <div class="container">
        <div class="left-content">
          <!-- Nội dung bên trái -->
        </div>
        <div class="right-content">
          <form
            @submit.prevent="handleSubmit"
            v-if="!showOtpForm"
            class="signup-form"
          >
            <h2>Đăng ký</h2>

            <!-- Họ và tên -->
            <div class="form-group">
              <label for="FULLNAME">Họ và tên</label>
              <input
                type="text"
                id="FULLNAME"
                v-model="FULLNAME"
                placeholder="Enter fullname"
                required
              />
              <span v-if="errors.FULLNAME" class="error">{{
                errors.FULLNAME
              }}</span>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="EMAIL">Email</label>
              <input
                type="email"
                id="EMAIL"
                v-model="EMAIL"
                placeholder="Enter email address"
                required
              />
              <span v-if="errors.EMAIL" class="error">{{ errors.EMAIL }}</span>
            </div>

            <!-- Số điện thoại -->
            <div class="form-group">
              <label for="PHONE_NUMBER">Số điện thoại</label>
              <input
                type="text"
                id="PHONE_NUMBER"
                v-model="PHONE_NUMBER"
                placeholder="Enter phone number"
                required
              />
              <span v-if="errors.PHONE_NUMBER" class="error">{{
                errors.PHONE_NUMBER
              }}</span>
            </div>

            <!-- Mật khẩu -->
            <div class="form-group password-group">
              <label for="PASSWORD">Mật khẩu</label>
              <div class="password-container">
                <input
                  :type="showPassword ? 'text' : 'PASSWORD'"
                  v-model="PASSWORD"
                  id="PASSWORD"
                  class="groupInput"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <i
                  :class="{
                    'fas fa-eye': !showPassword,
                    'fas fa-eye-slash': showPassword,
                  }"
                  @click="togglePasswordVisibility('PASSWORD')"
                  class="password-toggle"
                ></i>
              </div>
              <span v-if="errors.PASSWORD" class="error">{{
                errors.PASSWORD
              }}</span>
            </div>

            <!-- Xác nhận mật khẩu -->
            <div class="form-group password-group">
              <label for="confirm-password">Xác nhận mật khẩu</label>
              <div class="password-container">
                <input
                  :type="showConfirmPassword ? 'text' : 'PASSWORD'"
                  id="confirm-password"
                  v-model="confirmPassword"
                  placeholder="Confirm your password"
                  required
                />
                <i
                  :class="{
                    'fas fa-eye': !showConfirmPassword,
                    'fas fa-eye-slash': showConfirmPassword,
                  }"
                  @click="togglePasswordVisibility('showConfirmPassword')"
                  class="password-toggle"
                ></i>
              </div>
              <span v-if="errors.confirmPassword" class="error">{{
                errors.confirmPassword
              }}</span>
            </div>

            <!-- Điều khoản -->
            <div class="form-group voucher">
              <input type="checkbox" id="terms" v-model="agreedToTerms" />
              <label for="terms">Nhận thông tin khuyến mãi</label>
            </div>

            <button type="submit" class="signup-button" :disabled="loading">
              <span v-if="!loading">Đăng ký</span>
              <span v-else class="loading-spinner"></span>
            </button>
            <p class="login-link">
              BẠN ĐÃ CÓ TÀI KHOẢN? <a href="/dangnhap">ĐĂNG NHẬP</a>
            </p>

            <div class="social-login">
              <p>Hoặc đăng nhập với:</p>
              <div class="social-buttons">
                <button type="button" class="social-button facebook">
                  <i class="fab fa-facebook-f"></i>
                </button>
                <button type="button" class="social-button google">
                  <i class="fab fa-google"></i>
                </button>
                <button type="button" class="social-button twitter">
                  <i class="fab fa-twitter"></i>
                </button>
                <button type="button" class="social-button github">
                  <i class="fab fa-github"></i>
                </button>
              </div>
            </div>
          </form>
          <div v-if="showOtpForm" class="otp-form">
            <h2>Đăng ký thành công</h2>
            <p>
              Mã OTP đã được gửi đến địa chỉ email {{ EMAIL }}. Vui lòng kiểm
              tra email để xác thực.
            </p>
            <div class="form-group">
              <label for="otp">Nhập mã OTP</label>
              <input
                type="text"
                id="otp"
                v-model="otp"
                placeholder="Nhập mã OTP"
                required
              />
              <span v-if="otpErrors.otp" class="error">{{
                otpErrors.otp
              }}</span>
            </div>
            <button @click.prevent="verifyOtp" class="otp-button">
              Xác thực
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient"; // Import file cấu hình Axios

export default {
  data() {
    return {
      FULLNAME: "",
      EMAIL: "",
      PHONE_NUMBER: "",
      PASSWORD: "",
      confirmPassword: "",
      agreedToTerms: false,
      errors: {}, // Đối tượng lưu lỗi
      showPassword: false, // Hiển thị mật khẩu
      showConfirmPassword: false, // Hiển thị xác nhận mật khẩu
      showOtpForm: false, // Hiển thị form nhập OTP sau khi đăng ký thành công
      otp: "", // Biến lưu mã OTP nhập từ người dùng
      otpErrors: {}, // Đối tượng lưu lỗi cho OTP
    };
  },
  methods: {
    async handleSubmit() {
      this.errors = {}; // Reset lỗi trước khi gửi yêu cầu

      // Kiểm tra mật khẩu và xác nhận mật khẩu
      if (this.PASSWORD !== this.confirmPassword) {
        this.errors.confirmPassword = "Mật khẩu không khớp!";
        return;
      }

      try {
        const response = await axiosClient.post("/users/registerUser", {
          FULLNAME: this.FULLNAME,
          EMAIL: this.EMAIL,
          PHONE_NUMBER: this.PHONE_NUMBER,
          PASSWORD: this.PASSWORD,
        });

        if (response.data.success) {
          alert("Đăng ký người dùng thành công!")
          this.showOtpForm = true; // Hiển thị form nhập OTP
        } else if (response.data.errors) {
          this.errors = response.data.errors; // Gán lỗi từ backend vào đối tượng errors
        }
      } catch (error) {
        if (error.response && error.response.data.errors) {
          this.errors = error.response.data.errors; // Cập nhật lỗi cho từng trường
        } else {
          console.error("Error registering user:", error);
          alert("Đã xảy ra lỗi khi đăng ký!");
        }
      }
    },

    async verifyOtp() {
      this.otpErrors = {}; // Reset lỗi trước khi gửi yêu cầu

      try {
        const response = await axiosClient.post("/users/verifyOTPAndActivateUser", {
          email: this.EMAIL,
          otp: this.otp,
        });

        if (response.data.success) {
          alert("Xác thực thành công!");
          this.$router.push('/dangnhap');
        } else if (response.data.errors) {
          this.otpErrors = response.data.errors; // Gán lỗi từ backend vào đối tượng otpErrors
        }
      } catch (error) {
        if (error.response && error.response.data.errors) {
          this.otpErrors = error.response.data.errors; // Cập nhật lỗi cho từng trường
        } else {
          console.error("Error verifying OTP:", error);
          alert("Đã xảy ra lỗi khi xác thực mã OTP!");
        }
      }
    },

    togglePasswordVisibility(field) {
      if (field === "PASSWORD") {
        this.showPassword = !this.showPassword;
      } else if (field === "showConfirmPassword") {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./RegisterUser.scss";
</style>
