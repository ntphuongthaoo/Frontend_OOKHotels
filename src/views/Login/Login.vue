<template>
  <div class="login-page">
    <main>
      <div class="container">
        <div class="left-content">
          <!-- Nội dung bên trái -->
        </div>
        <div class="right-content">
          <form @submit.prevent="handleSubmit" class="login-form">
            <h2>Đăng nhập</h2>
            <div class="form-group">
              <label for="login-identifier">Email/Số điện thoại</label>
              <input type="text" id="login-identifier" v-model="identifier" placeholder="Enter email or phone number" required>
            </div>
            <div class="form-group">
              <label for="login-password">Mật khẩu</label>
              <input type="password" id="login-password" v-model="password" placeholder="Enter password" required>
            </div>
            <button type="submit" class="login-button">Đăng nhập</button>
            <p class="signup-link">CHƯA CÓ TÀI KHOẢN? <a href="#">ĐĂNG KÝ</a></p>
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
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      identifier: '', // Email/Số điện thoại
      password: '',
    };
  },
  methods: {
    handleSubmit() {
      // Xử lý logic khi gửi form
      alert('Form submitted successfully!');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./Login.scss";
</style>
