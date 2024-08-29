<template>
  <section class="text-center">
    <!-- Background image -->
    <div class="p-5 bg-image" style="background-image: url('https://images.unsplash.com/flagged/photo-1570547714730-329793a362f8?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'); height: 300px;"></div>

    <!-- Background image -->

    <div class="card mx-4 mx-md-5 shadow-5-strong" style="margin-top: -100px; backdrop-filter: blur(30px);">
      <div class="card-body px-md-5">
        <div class="row d-flex justify-content-center">
          <div class="col-lg-8 col-md-10">
            <h2 class="fw-bold mb-5">Đăng nhập</h2>
            <form @submit.prevent="handleSubmit">

              <!-- Email input -->
              <div class="form-outline email-label mb-4">
                <input v-model="form.email" type="email" id="form3Example3" class="form-control" />
                <label class="form-label" for="form3Example3">Email hoặc SDT</label>
              </div>

              <!-- Password input -->
              <div class="form-outline mb-4">
                <input v-model="form.password" type="password" id="form3Example4" class="form-control" />
                <label class="form-label" for="form3Example4">Mật khẩu</label>
              </div>

              <div class="d-flex justify-content-between align-items-center">
            <!-- Checkbox -->
            <div class="form-check mb-0">
              <input class="form-check-input me-2" type="checkbox" value="" id="form2Example3" />
              <label class="form-check-label" for="form2Example3">
                Remember me
              </label>
            </div>
            <a href="#!" class="text-body">Forgot password?</a>
          </div>

          <div class="text-center mt-4 pt-2">
            <button type="submit" class="btn btn-primary btn-block mb-4">
                Đăng nhập
              </button>
            <p class="small fw-bold mt-2 pt-1 mb-0">Don't have an account? <a href="/dangky"
                class="link-danger">Register</a></p>
          </div>

              <!-- Checkbox -->
              <!-- <div class="form-check d-flex justify-content-center mb-4">
                <input v-model="form.subscribe" class="form-check-input me-2" type="checkbox" value="" id="form2Example33" />
                <label class="form-check-label" for="form2Example33">
                  Đăng ký nhận bản tin của chúng tôi 
                </label>
              </div> -->

              <!-- Submit button -->
              

              <!-- Register buttons -->
              <!-- <div class="text-center">
                <p>hoặc đăng nhập với:</p>
                <button type="button" class="btn btn-link btn-floating mx-1">
                  <i class="fab fa-facebook-f"></i>
                </button>

                <button type="button" class="btn btn-link btn-floating mx-1">
                  <i class="fab fa-google"></i>
                </button> -->

                <!-- <button type="button" class="btn btn-link btn-floating mx-1">
                  <i class="fab fa-twitter"></i>
                </button>

                <button type="button" class="btn btn-link btn-floating mx-1">
                  <i class="fab fa-github"></i>
                </button> -->
              <!-- </div> -->
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        subscribe: false,
      }
    };
  },
  methods: {
    handleSubmit() {
      // Handle form submission logic here
      console.log('Form submitted:', this.form);
      // You might want to make an API call here
    }
  }
};
</script>

<style scoped>
.form-outline.email-label {
  margin-bottom: 20px; /* Điều chỉnh giá trị để có khoảng cách lớn hơn */
}
.text-center {
  max-width: 1000px;
  margin: 0 auto; /* Căn giữa nội dung */
}

.bg-image {
  background-size: cover;
  background-position: center;
  height: 500px;
  margin-top: 5px;
  background-color: #4e342e; /* Màu nâu đậm cho background */
}

.card {
  border-radius: 15px;
  background-color: #d7ccc8; /* Màu be nhẹ cho thẻ */
  color: #3e2723; /* Màu nâu đậm cho chữ */
}

.form-outline {
  position: relative;
  margin-bottom: 3rem;
  border: 1px solid #6d4c41;
  border-radius: 0.375rem;
  background-color: #efebe9; /* Nền của form-outline */
  color: #3e2723;
}

.form-outline + .form-outline {
  margin-top: 2rem; /* Khoảng cách giữa các form-outline */
}

.form-outline input.form-control {
  background-color: transparent; /* Nền trong suốt cho input */
  color: #3e2723; /* Màu chữ input */
  padding: 1rem; /* Khoảng cách nội dung bên trong input */
  border: none; /* Xóa bỏ viền của input */
  border-radius: 0.375rem; /* Góc bo tròn cho input */
  height: 3rem; /* Chiều cao cố định để căn giữa chữ */
  line-height: 1.5rem; /* Đảm bảo line-height phù hợp với chiều cao */
  display: flex;
  align-items: center; /* Căn giữa chữ theo chiều dọc */
  font-size: 1rem; /* Kích thước chữ */
  position: relative; /* Để label di chuyển theo */
}

.form-outline label.form-label {
  position: absolute;
  top: 50%; /* Đặt label vào giữa ô input */
  left: 1rem;
  /* transform: translateY(-50%);  */
  padding: 0 0.25rem; /* Khoảng cách giữa label và input */
  pointer-events: none;
  /* transition: all 0.2s ease; */
  /* font-size: 0.875rem; */
  color: #5d4037; /* Màu nâu cho chữ label */
  background-color: #d7ccc8; 
}

.form-outline input.form-control:focus ~ .form-label,
.form-outline input.form-control:not(:placeholder-shown) ~ .form-label {
  top: -0.75rem; /* Di chuyển label lên trên ô input */
  left: 1rem; /* Đặt label ở vị trí chính xác */
  font-size: 1rem; /* Kích thước chữ khi focus */
  color: #3e2723; /* Màu nâu đậm cho label khi focus */
  /* background-color: #d7ccc8;  */
}

.form-check {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #3e2723; /* Màu nâu cho checkbox */
}

.form-check-input {
  margin-right: 0.5rem;
}

.form-check-label {
  margin-bottom: 0;
}

.btn {
  border-radius: 0.375rem;
  background-color: #6d4c41; /* Màu nâu cho nút */
  color: #ffffff; /* Màu trắng cho chữ trên nút */
}

.btn:hover {
  background-color: #5d4037; /* Màu nâu đậm hơn khi hover */
}

a {
  color: #8d6e63; /* Màu nâu nhẹ cho liên kết */
}

a:hover {
  color: #5d4037; /* Màu nâu đậm khi hover */
}

</style>
