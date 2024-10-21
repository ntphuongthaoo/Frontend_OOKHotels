<template>
    <div class="signup-page">
      <main>
        <div class="container">
          <div class="left-content">
            <!-- Nội dung bên trái -->
          </div>
          <div class="right-content">
            <form
              v-if="!showOtpForm"
              @submit.prevent="handleSubmit"
              class="signup-form"
            >
              <h2>Đăng ký nhân viên</h2>
  
              <!-- Họ và tên -->
              <div class="form-group">
                <label for="FULLNAME">Họ và tên</label>
                <input
                  type="text"
                  id="FULLNAME"
                  v-model="FULLNAME"
                  placeholder="Nhập họ và tên"
                  required
                />
                <span v-if="errors.FULLNAME" class="error">{{ errors.FULLNAME }}</span>
              </div>
  
              <!-- Email -->
              <div class="form-group">
                <label for="EMAIL">Email</label>
                <input
                  type="email"
                  id="EMAIL"
                  v-model="EMAIL"
                  placeholder="Nhập địa chỉ email"
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
                  placeholder="Nhập số điện thoại"
                  required
                />
                <span v-if="errors.PHONE_NUMBER" class="error">{{ errors.PHONE_NUMBER }}</span>
              </div>
  
              <!-- Mật khẩu -->
              <div class="form-group password-group">
                <label for="PASSWORD">Mật khẩu</label>
                <div class="password-container">
                  <input
                    :type="showPassword ? 'text' : 'password'"
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
                <span v-if="errors.PASSWORD" class="error">{{ errors.PASSWORD }}</span>
              </div>
  
              <!-- Xác nhận mật khẩu -->
              <div class="form-group password-group">
                <label for="confirm-password">Xác nhận mật khẩu</label>
                <div class="password-container">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    id="confirm-password"
                    v-model="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
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
                <span v-if="errors.confirmPassword" class="error">{{ errors.confirmPassword }}</span>
              </div>
  
              <!-- Chọn khách sạn -->
              <div class="form-group">
                <label for="HOTEL_ID">Chọn khách sạn</label>
                <select id="HOTEL_ID" v-model="HOTEL_ID" required>
                  <option value="">Chọn khách sạn</option>
                  <option v-for="hotel in hotels" :key="hotel._id" :value="hotel._id">
                    {{ hotel.NAME }}
                  </option>
                </select>
                <span v-if="errors.HOTEL_ID" class="error">{{ errors.HOTEL_ID }}</span>
              </div>
  
              <button type="submit" class="signup-button" :disabled="loading">
                <span v-if="!loading">Đăng ký</span>
                <span v-else class="loading-spinner"></span>
              </button>
              <p class="login-link">
                BẠN ĐÃ CÓ TÀI KHOẢN? <a href="/login">ĐĂNG NHẬP</a>
              </p>
            </form>
  
            <div v-if="showOtpForm" class="otp-form">
              <h2>Xác thực OTP</h2>
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
                <span v-if="otpErrors.otp" class="error">{{ otpErrors.otp }}</span>
              </div>
              <button @click.prevent="verifyOtp" class="otp-button">Xác thực</button>
              <p class="login-link">
                BẠN ĐÃ CÓ TÀI KHOẢN? <a href="/login">ĐĂNG NHẬP</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  
  <script>
import axiosClient from "../../api/axiosClient"; // Import file cấu hình Axios

export default {
  name: "RegisterStaff",
  data() {
    return {
      FULLNAME: "",
      EMAIL: "",
      PHONE_NUMBER: "",
      PASSWORD: "",
      confirmPassword: "",
      HOTEL_ID: "", // Biến lưu ID khách sạn
      errors: {}, // Đối tượng lưu lỗi
      showPassword: false, // Hiển thị mật khẩu
      showConfirmPassword: false, // Hiển thị xác nhận mật khẩu
      loading: false, // Biến lưu trạng thái loading
      hotels: [], // Mảng khách sạn để chọn
      showOtpForm: false, // Trạng thái hiển thị form OTP
      otp: "", // Biến lưu mã OTP
      otpErrors: {}, // Đối tượng lưu lỗi cho OTP
    };
  },
  created() {
    this.fetchHotels(); // Gọi hàm lấy danh sách khách sạn khi khởi tạo component
  },
  methods: {
    async fetchHotels() {
      try {
        const response = await axiosClient.get("/hotels/getAllHotels"); // Lấy danh sách khách sạn từ server
        if (response.data.success) {
          this.hotels = response.data.data; // Lưu danh sách khách sạn vào biến hotels
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    },
    async handleSubmit() {
      this.errors = {}; // Reset lỗi trước khi gửi yêu cầu

      // Kiểm tra mật khẩu và xác nhận mật khẩu
      if (this.PASSWORD !== this.confirmPassword) {
        this.errors.confirmPassword = "Mật khẩu không khớp!";
        return;
      }

      this.loading = true; // Bắt đầu loading
      try {
        const response = await axiosClient.post("/users/registerUser", {
          FULLNAME: this.FULLNAME,
          EMAIL: this.EMAIL,
          PHONE_NUMBER: this.PHONE_NUMBER,
          PASSWORD: this.PASSWORD,
          HOTEL_ID: this.HOTEL_ID, // Gửi ID khách sạn nếu là nhân viên
        });

        if (response.data.success) {
          this.$toast.success("Đăng ký nhân viên thành công!", {
            position: "top-right",
            duration: 5000,
            dismissible: true,
          });
          this.showOtpForm = true; // Hiển thị form nhập OTP
        } else if (response.data.errors) {
          this.errors = response.data.errors; // Gán lỗi từ backend vào đối tượng errors
        }
      } catch (error) {
        if (error.response && error.response.data.errors) {
          this.errors = error.response.data.errors; // Cập nhật lỗi cho từng trường
        } else {
          console.error("Error registering user:", error);
          this.$toast.error("Đã xảy ra lỗi khi đăng ký!");
        }
      } finally {
        this.loading = false; // Kết thúc loading
      }
    },

    async verifyOtp() {
      this.otpErrors = {}; // Reset lỗi trước khi gửi yêu cầu

      try {
        const response = await axiosClient.post(
          "/users/verifyOTPAndActivateUser",
          {
            email: this.EMAIL,
            otp: this.otp,
          }
        );

        if (response.data.success) {
          this.$toast.success("Kích hoạt người dùng thành công!", {
            position: "top-right",
            duration: 5000,
            dismissible: true,
          });
          this.$router.push("/login"); // Chuyển hướng đến trang đăng nhập
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
  @import "../RegisterUser/RegisterUser.scss"; // Kết nối với file SCSS hiện tại
  </style>
  