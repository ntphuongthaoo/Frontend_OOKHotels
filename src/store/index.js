import { createStore } from "vuex";
import axios from "../api/axiosClient";
import { message } from "ant-design-vue";
import router from "../router";

const store = createStore({
  state: {
    isLoggedIn: false,
    userInfo: null,
    editingMode: false,
    users: [],
  },
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
      state.isLoggedIn = true;
    },
    SET_LOGIN_STATE(state, userInfo) {
      state.isLoggedIn = true;
      state.userInfo = userInfo;
    },
    LOGOUT(state) {
      state.isLoggedIn = false;
      state.userInfo = null;
    },
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        // Xác định email hoặc số điện thoại trong credentials
        const isEmail = credentials.EMAIL ? true : false;
        const payload = {
          [isEmail ? "EMAIL" : "PHONE_NUMBER"]:
            credentials.EMAIL || credentials.PHONE_NUMBER,
          PASSWORD: credentials.PASSWORD,
        };

        const response = await axios.post("/users/loginUser", payload);

        if (response.status >= 200 && response.status <= 300) {
          const token = response.data.accessToken;
          localStorage.setItem("accessToken", token);
          commit("SET_LOGIN_STATE");

          dispatch("checkToken"); // Lấy thông tin người dùng sau khi login thành công

          message.success("Đăng nhập thành công!");
        }
      } catch (error) {
        // message.error("Đăng nhập thất bại!");
        throw error;
      }
    },
    async logout({ commit }) {
      localStorage.removeItem("accessToken");
      commit("LOGOUT");
      message.success("Đã đăng xuất thành công!");
      router.push('/dangnhap');
    },
    async checkToken({ commit, dispatch }) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await axios.get("/users/profile");
          if (response.status >= 200 && response.status < 300) {
            const userInfo = response.data;
            commit("SET_USER_INFO", userInfo);

            const roles = userInfo.ROLE;

            // Điều hướng dựa trên vai trò
            if (roles.ADMIN) {
              router.push("/dashboard");  // Điều hướng admin đến trang Dashboard
            } else if (roles.BRANCH_MANAGER) {
              router.push("/dashboard");  // Điều hướng quản lý chi nhánh
            } else if (roles.STAFF) {
              router.push("/dashboard");  // Điều hướng nhân viên
            } else {
              router.push("/trangchu");  // Điều hướng người dùng thông thường
            }
          } else {
            console.error("Unexpected response status:", response.status);
            dispatch("LOGOUT");
          }
        } catch (error) {
          console.error("Error while checking token:", error);
          dispatch("LOGOUT");
        }
      } else {
        console.log("No token found in localStorage.");
      }
    },
  },
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    userInfo: (state) => state.userInfo,
  },
});

export default store;
