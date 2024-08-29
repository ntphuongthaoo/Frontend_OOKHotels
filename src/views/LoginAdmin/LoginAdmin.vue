<template>
  <div class="containPage">
    <section>
      <div class="container h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col col-xl-10">
            <div class="card loginForm">
              <div class="row g-0">
                <div class="col-md-6 col-lg-6 d-flex align-items-center">
                  <div class="card-body p-4 p-lg-5 text-black">
                    <form @submit.prevent="login">
                      <div class="d-flex align-items-center mb-3 pb-1">
                        <div class="logo">
                          <span class="titleWeb"
                            >Comments
                            <span class="text-dark">System</span></span
                          >
                        </div>
                      </div>

                      <div class="fw-normal pb-2 desLogin">
                        Chào mừng đến với hệ thống
                      </div>

                      <div class="group">
                        <label for="username">
                          <i class="fa-solid fa-phone iconForm"></i>
                        </label>
                        <input
                          type="text"
                          id="username"
                          class="groupInput"
                          v-model="username"
                          name="username"
                          autocomplete="off"
                          placeholder="Nhập tên tài khoản hoặc email"
                          required
                        />
                      </div>

                      <div class="group2">
                        <label for="password">
                          <i class="fa-solid fa-lock iconForm"></i>
                        </label>
                        <input
                          :type="showPassword ? 'text' : 'password'"
                          v-model="password"
                          name="password"
                          id="password"
                          class="groupInput"
                          autocomplete="off"
                          placeholder="Nhập mật khẩu"
                          required
                        />
                        <div @click="toggleShowPassword" class="iconPassword">
                          <div v-if="showPassword">
                            <i class="fa-solid fa-eye"></i>
                          </div>
                          <div v-else>
                            <i class="fa-solid fa-eye-slash"></i>
                          </div>
                        </div>
                      </div>
                      <div class="pt-1 mb-4">
                        <button class="btnPay">Đăng Nhập</button>
                      </div>

                      <a class="small text-muted" href="#!">Quên mật khẩu</a>
                      <p class="mb-1 pb-lg-2" style="color: #393f81">
                        Đăng ký tài khoản
                        <router-link to="/register" class="button">
                          <strong style="color: #393f81">Tại đây</strong>
                        </router-link>
                      </p>
                    </form>
                  </div>
                </div>
                <div class="col-md-6 col-lg-6 d-none d-md-block m-auto">
                  <img
                    src="https://i.pinimg.com/564x/5c/f4/39/5cf4396a86b21b2e8a414ac15c52f0fe.jpg"
                    alt="login form"
                    class="imageLogin"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <a-modal
      v-model:open="isModalVisible"
      title="Thông báo"
      :footer="null"
      @cancel="handleCancel"
    >
      <p>Tài khoản không thuộc về tổ chức nào, bạn có muốn đăng ký tổ chức?</p>
      <!-- <a-button @click="handleCancel">Tiếp tục đăng nhập</a-button> -->
      <a-button type="primary" @click="navigateToRegister"
        >Đăng ký tổ chức</a-button
      >
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const isModalVisible = ref(false);
const userRole = ref(""); // Thêm biến này để lưu trữ vai trò của người dùng
const router = useRouter();

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};

const login = async () => {
  const role = await store.dispatch("login", {
    username: username.value,
    password: password.value,
  });
  if (role === "admin") {
    router.push("/");
  } else if (role === "organ") {
    router.push("/pages/organizations");
  } else if (role === "unauthorized") {
    isModalVisible.value = true;
  }
};

const handleCancel = () => {
  isModalVisible.value = false;
};

const navigateToRegister = () => {
  isModalVisible.value = false;
  router.push("/organization/register");
};
</script>

<style lang="scss" scoped>
@import "./LoginAdmin.scss";
</style>
