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
    cart: null,
    footerOffsetTop: 0,
    bookingDetails: {
      hotel: null,
      room: null,
      startDate: null,
      endDate: null,
      totalPrice: 0,
    },
    selectedRoomsCart: [],
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
    SET_CART(state, cart) {
      state.cart = cart;
    },
    SET_FOOTER_OFFSET(state, offset) {
      state.footerOffsetTop = offset;
    },
    SET_BOOKING_DETAIL(state, details) {
      console.log("Đang lưu chi tiết booking vào state:", details);
      state.bookingDetails = details;
    },
    SET_SELECTEDROOMS_CART(state, rooms) {
      state.selectedRoomsCart = rooms;
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
          // commit("SET_LOGIN_STATE", userInfo);

          const userInfo = await dispatch("checkToken"); // Lấy thông tin người dùng sau khi login thành công
          if (userInfo) {
            commit("SET_USER_INFO", userInfo);
          }
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
      router.push('/login');
    },
    async checkToken({ commit, dispatch }) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await axios.get("/users/profile");
          if (response.status >= 200 && response.status < 300) {
            const userInfo = response.data;
            
            commit("SET_USER_INFO", userInfo);
            // const roles = userInfo.ROLE;

            return userInfo;

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
    async fetchCart({ commit }) {
      try {
        const response = await axios.post("/carts/getCartByUserId");
        if (response && response.data.cart) {
          commit("SET_CART", response.data.cart);
        } else {
          // Đặt cart thành đối tượng trống nếu giỏ hàng trống
          commit("SET_CART", {});
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    },
    updateFooterOffset({ commit }, offset) {
      commit('SET_FOOTER_OFFSET', offset);
    },

    setBookingDetails({ commit }, details) {
      commit("SET_BOOKING_DETAILS", details);
    },
  },
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    userInfo: (state) => state.userInfo,
    isAdmin: (state) => {
      return state.userInfo?.ROLE?.ADMIN === true;
    },    

    getHotelId: (state) => {
      return state.userInfo?.HOTEL_ID || null;
    },
    cartItemCount: (state) => {
      if (state.cart && Array.isArray(state.cart.HOTELS)) {
        // Lọc các phòng có TOTAL_PRICE_FOR_ROOM khác null, sau đó đếm số phòng
        return state.cart.HOTELS.reduce((count, hotel) => {
          return count + hotel.ROOMS.filter(room => room.TOTAL_PRICE_FOR_ROOM !== null).length;
        }, 0);
      }
      return 0;
    },
    getBookingDetails(state) {
      return state.bookingDetails;
    },
    getSelectedRoomsCart: (state) => state.selectedRoomsCart,
  },
});

export default store;
