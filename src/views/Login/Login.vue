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
            <button type="submit" class="login-button">Đăng nhập</button>
            <p class="signup-link">
              CHƯA CÓ TÀI KHOẢN? <a href="dangky">ĐĂNG KÝ</a>
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
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  data() {
    return {
      identifier: "",
      password: "",
    };
  },
  methods: {
    ...mapActions(["login"]),

    async handleSubmit() {
      // Kiểm tra giá trị đầu vào để xác định là email hay số điện thoại
      const isEmail = this.identifier.includes("@");
      const payload = {
        [isEmail ? "EMAIL" : "PHONE_NUMBER"]: this.identifier,
        PASSWORD: this.password,
      };

      try {
        // const result = await this.$store.dispatch("login", payload);
        await this.login(payload);
        const redirect = this.$route.query.redirect || "/trangchu";
        this.$router.push(redirect);
      } catch (error) {
        this.$message.error(
          error.response?.data?.message || "Đăng nhập thất bại!"
        );
      }
    },
  },
};
</script>

<style scoped>
@import "./Login.scss";
</style>
