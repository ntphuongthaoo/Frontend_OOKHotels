<template>
  <div class="login-page">
    <main>
      <div class="container">
        <div class="left-content">
          <!-- Nội dung bên trái -->
        </div>
        <div class="right-content">
          <!-- Form Đăng nhập -->
          <form
            v-if="!showForgotPasswordForm && !showOtpForm && !showResetPasswordForm"
            @submit.prevent="handleSubmit"
            class="login-form"
          >
            <h2>Đăng nhập</h2>
            <div class="form-group">
              <label for="login-identifier">Email/Số điện thoại</label>
              <input
                type="text"
                id="login-identifier"
                v-model="identifier"
                placeholder="Nhập email hoặc số điện thoại"
                required
              />
            </div>
            <div class="form-group">
              <label for="login-password">Mật khẩu</label>
              <input
                type="password"
                id="login-password"
                v-model="password"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            <p class="forgot-password">
              <a href="#" @click.prevent="openForgotPasswordForm">Quên mật khẩu?</a>
            </p>
            <button type="submit" class="login-button">Đăng nhập</button>
            <p class="signup-link">
              CHƯA CÓ TÀI KHOẢN? <a href="register">ĐĂNG KÝ</a>
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

          <!-- Form Quên mật khẩu -->
          <div v-if="showForgotPasswordForm" class="forgot-password-form">
            <h2>Quên mật khẩu</h2>
            <p class="description">
              Vui lòng nhập địa chỉ email của bạn để đặt lại mật khẩu.
            </p>
            <div class="form-group">
              <label for="forgot-email">Email</label>
              <input
                type="email"
                id="forgot-email"
                v-model="forgotEmail"
                placeholder="Nhập email của bạn"
                required
              />
            </div>
            <button @click.prevent="sendForgotPassword" class="forgot-password-button">
              Gửi yêu cầu
            </button>
            <p class="back-to-login">
              <a href="#" @click.prevent="openLoginForm">Quay lại đăng nhập</a>
            </p>
          </div>

          <!-- Form Nhập OTP -->
          <div v-if="showOtpForm" class="otp-form">
            <h2>Xác thực OTP</h2>
            <p class="description">Nhập mã OTP đã được gửi đến email của bạn.</p>
            <div class="form-group">
              <label for="otp-code">Mã OTP</label>
              <input
                type="text"
                id="otp-code"
                v-model="otpCode"
                placeholder="Nhập mã OTP"
                required
              />
            </div>
            <button @click.prevent="verifyOtp" class="otp-button">Xác thực OTP</button>
          </div>

          <!-- Form Đặt lại mật khẩu -->
          <div v-if="showResetPasswordForm" class="reset-password-form">
            <h2>Đặt lại mật khẩu</h2>
            <div class="form-group">
              <label for="new-password">Mật khẩu mới</label>
              <input
                type="password"
                id="new-password"
                v-model="newPassword"
                placeholder="Nhập mật khẩu mới"
                required
              />
            </div>
            <div class="form-group">
              <label for="confirm-password">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirm-password"
                v-model="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                required
              />
            </div>
            <button @click.prevent="resetPassword" class="reset-password-button">
              Đặt lại mật khẩu
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>



<script>
import { mapActions } from "vuex";
import axiosClient from "../../api/axiosClient";

export default {
  data() {
    return {
      identifier: "",
      password: "",
      showForgotPasswordForm: false, // Hiển thị form quên mật khẩu
      showOtpForm: false, // Hiển thị form nhập OTP
      showResetPasswordForm: false, // Hiển thị form đặt lại mật khẩu
      forgotEmail: "", // Lưu email nhập vào form quên mật khẩu
      otpCode: "", // Lưu mã OTP
      newPassword: "", // Mật khẩu mới
      confirmPassword: "", // Xác nhận mật khẩu mới
    };
  },
  methods: {
    ...mapActions(["login", "checkToken"]),

    async handleSubmit() {
      const isEmail = this.identifier.includes("@");
      const payload = {
        [isEmail ? "EMAIL" : "PHONE_NUMBER"]: this.identifier,
        PASSWORD: this.password,
      };

      try {
        await this.login(payload);

        const userInfo = await this.checkToken();

        if (userInfo && userInfo.ROLE) {
          // Chuyển hướng đến trang dashboard cho ADMIN và STAFF
          if (userInfo.ROLE.ADMIN || userInfo.ROLE.STAFF) {
            this.$router.push("/dashboard");
          } else {
            const redirect = this.$route.query.redirect || "/home";
            this.$router.push(redirect);
          }
        }
      } catch (error) {
        if (error.response && error.response.status >= 400) {
          this.$message.error(
            error.response?.data?.message || "Đăng nhập thất bại!"
          );
        }
      }
    },

    // Hiển thị form quên mật khẩu
    openForgotPasswordForm() {
      this.showForgotPasswordForm = true;
    },

    // Quay lại form đăng nhập
    openLoginForm() {
      this.showForgotPasswordForm = false;
      this.showOtpForm = false;
      this.showResetPasswordForm = false;
    },

    // Gửi yêu cầu quên mật khẩu
    async sendForgotPassword() {
      try {
        const response = await axiosClient.post("/users/forgotPassword", {
          email: this.forgotEmail,
        });

        if (response.data.message) {
          this.$toast.success(
            "Yêu cầu đã được gửi! Vui lòng kiểm tra email để lấy mã OTP.",
            {
              position: "top-right",
              duration: 5000,
              dismissible: true,
            }
          );
          this.showForgotPasswordForm = false;
          this.showOtpForm = true; // Chuyển sang form nhập OTP
        } else {
          this.$toast.error("Không thể gửi yêu cầu quên mật khẩu.");
        }
      } catch (error) {
        console.error("Error sending forgot password request:", error);
        this.$toast.error("Đã xảy ra lỗi khi gửi yêu cầu quên mật khẩu!");
      }
    },

    // Xác thực OTP
    async verifyOtp() {
      try {
        const response = await axiosClient.post("/users/verifyOTPAndActivateUser", {
          email: this.forgotEmail,
          otp: this.otpCode,
        });

        if (response.data.success) {
          this.$toast.success("OTP xác thực thành công!", {
            position: "top-right",
            duration: 5000,
            dismissible: true,
          });
          this.showOtpForm = false;
          this.showResetPasswordForm = true; // Chuyển sang form đặt lại mật khẩu
        } else {
          this.$toast.error("Mã OTP không chính xác hoặc đã hết hạn.");
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
        this.$toast.error("Đã xảy ra lỗi khi xác thực mã OTP!");
      }
    },

    // Đặt lại mật khẩu
    async resetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.$toast.error("Mật khẩu không khớp!");
        return;
      }

      try {
        const response = await axiosClient.post("/users/resetPassword", {
          email: this.forgotEmail,
          otp: this.otpCode,
          newPassword: this.newPassword,
        });

        if (response.data.success) {
          this.$toast.success("Đặt lại mật khẩu thành công!", {
            position: "top-right",
            duration: 5000,
            dismissible: true,
          });
          this.showResetPasswordForm = false;
          this.openLoginForm(); // Quay lại form đăng nhập
        } else {
          this.$toast.error("Không thể đặt lại mật khẩu.");
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        this.$toast.error("Đã xảy ra lỗi khi đặt lại mật khẩu!");
      }
    },
  },
};
</script>



<style scoped>
@import "./Login.scss";
</style>
