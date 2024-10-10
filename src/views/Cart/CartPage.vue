<template>
  <div class="cart-container">
    <h3>Giỏ hàng của bạn</h3>

    <!-- Phần đầu của bảng -->
    <table class="custom-table">
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th>Loại</th>
          <th>Giá/Đêm</th>
          <th>Thời gian</th>
          <th>Số phòng</th>
          <th>Số người</th>
          <th>Tổng giá</th>
          <th>Thao tác</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="(hotel, index) in hotels" :key="index">
          <tr class="hotel-name-row">
            <td>
              <input
                type="checkbox"
                v-model="hotel.isSelected"
                @change="toggleHotelRooms(hotel)"
                class="custom-checkbox"
              />
            </td>
            <td colspan="8" class="hotel-name" @click="goToHotelDetail(hotel)">
              <i class="fa fa-hotel"></i> {{ hotel.HOTEL_NAME }}
            </td>
          </tr>

          <tr v-for="(room, roomIndex) in hotel.ROOMS" :key="roomIndex">
            <td>
              <input
                type="checkbox"
                v-model="room.isSelected"
                @change="toggleRoom(room)"
                class="custom-checkbox"
              />
            </td>
            <td class="image-column">
              <img
                :src="room.imageUrl || '/assets/default-room.jpg'"
                alt="Room Image"
                class="room-image"
              />
            </td>
            <td>{{ room.type }}</td>
            <td>{{ room.pricePerNight.toLocaleString() }} VND</td>
            <td>
              <p>
                {{ formatDate(room.startDate) }} -
                {{ formatDate(room.endDate) }}
              </p>
              <p>{{ calculateStayDuration(room.startDate, room.endDate) }}</p>
            </td>
            <td>
              <div class="room-number-box">
                {{ room.roomNumber }}
              </div>
            </td>
            <td>
              <span>{{ room.people }}</span>
            </td>
            <td>{{ room.totalPrice.toLocaleString() }} VND</td>
            <td>
              <button class="edit-btn" @click="showUpdateModal(room)">
                Chỉnh sửa
              </button>
              <button class="delete-btn" @click="removeRoom(room.ROOM_ID)">
                Xóa
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <!-- Modal for updating room information -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>Cập nhật phòng</h2>

        <div class="form-group">
          <label for="startDate">Ngày bắt đầu:</label>
          <input
            type="date"
            id="startDate"
            v-model="selectedRoom.newStartDate"
          />
        </div>

        <div class="form-group">
          <label for="endDate">Ngày kết thúc:</label>
          <input type="date" id="endDate" v-model="selectedRoom.newEndDate" />
        </div>

        <div class="modal-buttons">
          <button class="update-btn" @click="confirmUpdateRoom">
            Cập nhật
          </button>
          <button class="cancel-btn" @click="closeModal">Hủy</button>
        </div>
      </div>
    </div>

    <div v-if="totalRooms > 0" class="floating-modal">
      <div class="modal-content">
        <div class="modal-info">
          <span>Tổng số lượng phòng: {{ totalRooms }}</span>
          <span>Tổng giá: {{ totalPrice.toLocaleString() }} VND</span>
        </div>
        <div class="booking">
          <button class="checkout-btn" @click="checkout">Đặt phòng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      hotels: [], // Dữ liệu khách sạn sẽ được lưu vào đây
      showModal: false, // Hiển thị modal chỉnh sửa
      selectedRoom: {
        // Dữ liệu phòng được chọn để chỉnh sửa
        roomId: "",
        newStartDate: "",
        newEndDate: "",
      },
      totalRooms: 0,
      totalPrice: 0,
      footerOffsetTop: 0, // Vị trí trên của footer
      lastRoomOffsetTop: 0, // Vị trí trên của phòng cuối cùng trong giỏ hàng
      floatingModalHeight: 0, // Chiều cao của modal nổi
      gapSpace: 150,
    };
  },
  async created() {
    await this.fetchCartData();
    this.updateOffsets(); // Cập nhật vị trí của footer và phần tử cuối
    window.addEventListener("scroll", this.handleScroll); // Theo dõi sự kiện cuộn
    window.addEventListener("resize", this.updateOffsets); // Cập nhật khi thay đổi kích thước cửa sổ
  },

  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.updateOffsets);
  },

  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    },
    footerOffsetTop() {
      return this.$store.state.footerOffsetTop; // Lấy giá trị từ Vuex
    },
  },
  methods: {
    increasePeople(room) {
      if (room.people < room.CUSTOM_ATTRIBUTES.number_of_people) {
        room.people += 1;
        this.calculateTotal(); // Cập nhật tổng sau khi thay đổi
      }
    },

    decreasePeople(room) {
      if (room.people > 1) {
        room.people -= 1;
        this.calculateTotal(); // Cập nhật tổng sau khi thay đổi
      }
    },
    // Tính toán vị trí footer và phần tử cuối cùng trong giỏ hàng
    updateOffsets() {
      const footer = document.querySelector("footer"); // Tìm footer từ DOM toàn cục
      const lastRoom = document.querySelector(
        ".cart-container tbody tr:last-child"
      ); // Chọn phần tử cuối cùng trong giỏ hàng
      const floatingModal = document.querySelector(".floating-modal");

      if (footer) {
        this.footerOffsetTop = footer.offsetTop;
      }

      if (lastRoom) {
        this.lastRoomOffsetTop = lastRoom.offsetTop + lastRoom.clientHeight; // Vị trí của phòng cuối cùng trong giỏ hàng
      }

      if (floatingModal) {
        this.floatingModalHeight = floatingModal.clientHeight; // Chiều cao của modal nổi
      }
    },
    handleScroll() {
      const floatingModal = document.querySelector(".floating-modal");
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;

      if (!floatingModal) return;

      // Tính toán vị trí tối đa mà modal có thể "dừng lại"
      const maxStopPosition =
        this.footerOffsetTop - this.floatingModalHeight - this.gapSpace;

      if (scrollTop + windowHeight >= this.footerOffsetTop) {
        floatingModal.classList.add("sticky");
        floatingModal.style.position = "absolute";
        floatingModal.style.top = `${maxStopPosition}px`;
        floatingModal.style.bottom = "auto";
      } else if (
        scrollTop + windowHeight >=
        this.lastRoomOffsetTop + this.floatingModalHeight
      ) {
        // Khi modal nằm giữa footer và phần tử cuối cùng
        floatingModal.classList.add("sticky");
        floatingModal.style.position = "fixed";
        floatingModal.style.bottom = "0px";
        floatingModal.style.top = "auto";
      } else {
        // Khi modal không chạm tới footer hoặc phần tử cuối cùng
        floatingModal.classList.remove("sticky");
        floatingModal.style.position = "fixed";
        floatingModal.style.bottom = "0px";
        floatingModal.style.top = "auto";
      }
    },

    getSelectedRooms() {
      const selectedRooms = [];

      this.hotels.forEach((hotel) => {
        hotel.ROOMS.forEach((room) => {
          if (room.isSelected) {
            selectedRooms.push({
              roomId: room.ROOM_ID,
              startDate: room.startDate,
              endDate: room.endDate,
              pricePerNight: room.pricePerNight,
              totalPrice: room.totalPrice,
              roomNumber: room.roomNumber,
              people: room.people,
              hotelName: hotel.HOTEL_NAME,
            });
          }
        });
      });

      return selectedRooms;
    },

    async checkout() {
      const selectedRooms = this.getSelectedRooms();

      this.$store.commit("SET_SELECTEDROOMS_CART", selectedRooms);

      this.$router.push({ name: "PaymentPage" });
    },

    async fetchCartData() {
      try {
        const response = await axiosClient.post("/carts/getCartByUserId");
        console.log("Cart Data:", response.data);
        if (response.data.cart && response.data.cart.HOTELS) {
          this.hotels = response.data.cart.HOTELS.map((hotel) => ({
            HOTEL_NAME: hotel.HOTEL_NAME,
            HOTEL_ID: hotel.HOTEL_ID,
            ROOMS: hotel.ROOMS.map((room) => ({
              imageUrl: room.IMAGES[0] || "/assets/default-room.jpg", // URL ảnh đầu tiên hoặc ảnh mặc định
              type: `${room.TYPE} ${room.CUSTOM_ATTRIBUTES.bedType}`, // Loại phòng + loại giường
              pricePerNight: room.PRICE_PERNIGHT, // Giá mỗi đêm
              roomNumber: room.ROOM_NUMBER, // Số phòng
              startDate: room.START_DATE, // Ngày bắt đầu
              endDate: room.END_DATE, // Ngày kết thúc
              people: room.CUSTOM_ATTRIBUTES.number_of_people || 1, // Số người
              totalPrice: room.TOTAL_PRICE_FOR_ROOM, // Tổng giá cho phòng
              ROOM_ID: room.ROOM_ID,
              IS_IN_CART: room.IS_IN_CART, // ID phòng
              isSelected: false, // Trạng thái chọn của phòng
            })),
          }));
        }
        this.calculateTotal();
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    },

    calculateTotal() {
      let totalRooms = 0;
      let totalPrice = 0;

      this.hotels.forEach((hotel) => {
        hotel.ROOMS.forEach((room) => {
          if (room.isSelected) {
            totalRooms += 1;
            totalPrice += room.totalPrice;
          }
        });
      });

      this.totalRooms = totalRooms;
      this.totalPrice = totalPrice;
    },

    toggleHotelRooms(hotel) {
      hotel.ROOMS.forEach((room) => {
        room.isSelected = hotel.isSelected;
      });
      this.calculateTotal(); // Cập nhật tổng sau khi chọn
    },

    // Phương thức chọn/bỏ chọn phòng
    toggleRoom(room) {
      this.calculateTotal(); // Cập nhật tổng sau khi chọn
    },

    goToHotelDetail(hotel) {
      // Điều hướng đến trang chi tiết của khách sạn dựa trên ID hoặc slug
      this.$router.push({
        name: "HotelDetail",
        params: { id: hotel.HOTEL_ID },
      });
    },

    // Phương thức định dạng ngày tháng
    formatDate(date) {
      const formattedDate = new Date(date);
      const day = String(formattedDate.getDate()).padStart(2, "0"); // Lấy ngày và thêm số 0 nếu cần
      const month = String(formattedDate.getMonth() + 1).padStart(2, "0"); // Lấy tháng và thêm số 0 nếu cần (tháng bắt đầu từ 0)
      const year = formattedDate.getFullYear(); // Lấy năm

      return `${day}/${month}/${year}`; // Trả về chuỗi theo định dạng dd/MM/yyyy
    },

    // Phương thức tính thời gian ở (ví dụ: "3 ngày 2 đêm")
    calculateStayDuration(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.floor((end - start) / (1000 * 60 * 60 * 24)); // Tính số ngày ở
      const days = duration + 1; // Số ngày = khoảng cách giữa 2 ngày + 1
      const nights = duration; // Số đêm = khoảng cách giữa 2 ngày
      return `${days} ngày ${nights} đêm`;
    },

    async removeRoom(roomId) {
      try {
        const result = await Swal.fire({
          title: "Bạn chắc chắn muốn xóa phòng này không?",
          text: "Hành động này không thể hoàn tác!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#e74c3c",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
          await axiosClient.post("/carts/removeRoomFromCart", { roomId });
          await this.fetchCartData();
          await this.$store.dispatch("fetchCart");
          Swal.fire("Đã xóa!", "Phòng đã được xóa khỏi giỏ hàng.", "success");
        }
      } catch (error) {
        console.error("Error removing room:", error);
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa phòng.", "error");
      }
    },

    // Phương thức đặt phòng
    async bookRoom(room) {
      console.log(`Booking room with ID: ${room.ROOM_ID}`);
      // Thêm logic đặt phòng ở đây
    },

    // Phương thức hiển thị modal chỉnh sửa
    showUpdateModal(room) {
      this.selectedRoom = {
        roomId: room.ROOM_ID,
        newStartDate: room.startDate.split("T")[0],
        newEndDate: room.endDate.split("T")[0],
      };
      this.showModal = true; // Hiển thị modal cập nhật
    },

    // Phương thức đóng modal
    closeModal() {
      this.showModal = false;
    },

    async confirmUpdateRoom() {
      try {
        const result = await Swal.fire({
          title: "Bạn chắc chắn muốn cập nhật thông tin phòng này không?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#28a745",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Cập nhật",
          cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
          this.updateRoom(); // Gọi phương thức cập nhật phòng
        }
      } catch (error) {
        console.error("Error confirming update:", error);
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi xác nhận cập nhật.", "error");
      }
    },

    // Phương thức cập nhật thông tin phòng
    async updateRoom() {
      try {
        await axiosClient.post("/carts/updateRoomInCart", {
          roomId: this.selectedRoom.roomId,
          newStartDate: this.selectedRoom.newStartDate,
          newEndDate: this.selectedRoom.newEndDate,
        });

        await this.fetchCartData();
        this.closeModal();
        Swal.fire(
          "Thành công!",
          "Thông tin phòng đã được cập nhật.",
          "success"
        );
      } catch (error) {
        console.error("Error updating room:", error);
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi cập nhật phòng.", "error");
      }
    },
  },
};
</script>

<style scoped>
@import "./CartPage.scss";
</style>
