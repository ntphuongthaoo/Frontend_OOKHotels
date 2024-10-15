<template>
  <div class="payment-wrapper">
    <!-- Thông tin khách hàng bên trái -->
    <div class="customer-info">
      <h2>Thông tin người đặt phòng</h2>
      <form @submit.prevent="processPayment">
        <!-- Thông tin khách hàng -->
        <div class="form-group">
          <label for="customerName">Tên khách hàng</label>
          <input
            id="customerName"
            type="text"
            v-model="customerName"
            class="form-control"
            :class="{ 'is-invalid': errors.customerName }"
            @input="handleInput('customerName')"
            required
            placeholder="Nhập tên khách hàng"
          />
          <div v-if="errors.customerName" class="invalid-feedback">
            {{ errors.customerName }}
          </div>
        </div>

        <div class="form-group">
          <label for="customerPhone">Số điện thoại</label>
          <input
            id="customerPhone"
            type="text"
            v-model="customerPhone"
            class="form-control"
            :class="{ 'is-invalid': errors.customerPhone }"
            @input="handleInput('customerPhone')"
            required
            placeholder="Nhập số điện thoại"
          />
          <div v-if="errors.customerPhone" class="invalid-feedback">
            {{ errors.customerPhone }}
          </div>
        </div>

        <div class="form-group">
          <label for="citizenId">Số CCCD</label>
          <input
            id="citizenId"
            type="text"
            v-model="citizenId"
            class="form-control"
            :class="{ 'is-invalid': errors.citizenId }"
            @input="handleInput('citizenId')"
            required
            placeholder="Nhập số CCCD"
          />
          <div v-if="errors.citizenId" class="invalid-feedback">
            {{ errors.citizenId }}
          </div>
        </div>
      </form>
    </div>

    <!-- Thông tin phòng đã chọn bên phải -->
    <div class="right-booking-info">
      <div class="booking-info">
        <h3>Thông tin đặt phòng</h3>

        <!-- Danh sách phòng -->
        <div v-if="selectedRooms && selectedRooms.length > 0">
          <div
            v-for="(room, index) in selectedRooms"
            :key="index"
            class="room-section"
          >
            <p class="hotel-name-booking">{{ room.hotelName }}</p>
            <p class="time">
              {{ formatDate(room.startDate) }} -
              {{ formatDate(room.endDate) }} ({{
                calculateTotalDays(room.startDate, room.endDate)
              }}
              ngày, {{ calculateNights(room.startDate, room.endDate) }} đêm)
            </p>
            <h4>Thông tin phòng</h4>
            <p>
              <b>Phòng:</b> {{ room.type }} - Số phòng: {{ room.roomNumber }}
            </p>
            <div class="price-cancle">
              <p class="price">
                {{ room.pricePerNight.toLocaleString() }} VND / đêm
              </p>
            </div>
            <hr />
          </div>
        </div>

        <!-- Trường hợp chỉ có một phòng -->
        <div v-else-if="selectedRoom">
          <p class="hotel-name-booking">{{ hotel.NAME }}</p>
          <p class="time">
            {{ formattedStartDate }} - {{ formattedEndDate }} ({{
              calculateTotalDays(
                bookingDetails.startDate,
                bookingDetails.endDate
              )
            }}
            ngày,
            {{
              calculateNights(bookingDetails.startDate, bookingDetails.endDate)
            }}
            đêm)
          </p>
          <h4>Thông tin phòng</h4>
          <p>
            <b>Phòng:</b> {{ selectedRoom.TYPE }}
            {{ selectedRoom.CUSTOM_ATTRIBUTES?.bedType || "" }}
          </p>
          <div class="price-cancle">
            <p class="price">
              {{ selectedRoom.PRICE_PERNIGHT?.toLocaleString() }} VNĐ / đêm
            </p>
          </div>
        </div>

        <div class="total-info-book">
          <div>Tổng cộng:</div>
          <div class="total-book">{{ totalPrice.toLocaleString() }} VNĐ</div>
        </div>

        <!-- Nút xác nhận thanh toán -->
        <button
          type="button"
          class="confirm-booking-btn"
          :disabled="!selectedRoom"
          :class="{ 'disabled-btn': !selectedRoom }"
          @click="processPayment"
        >
          Xác nhận thanh toán
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";

export default {
  data() {
    return {
      customerName: "",
      customerPhone: "",
      citizenId: "",
      selectedRooms: [],
      errors: {
        customerName: "",
        customerPhone: "",
        citizenId: "",
      },
    };
  },
  created() {
    this.selectedRooms = this.$store.getters.getSelectedRoomsCart;
    // if (
    //   (!this.selectedRooms || this.selectedRooms.length === 0) &&
    //   !this.bookingDetails.room
    // ) {
    //   this.$toast.error(
    //     "Không có phòng nào được chọn. Vui lòng quay lại và chọn phòng."
    //   );
    //   this.$router.push({ name: "CartPage" });
    // }
  },
  computed: {
    bookingDetails() {
      const details = this.$store.getters.getBookingDetails;
      console.log("Dữ liệu từ Vuex Store trong PaymentPage:", details);
      return details;
    },
    hotel() {
      console.log("Hotel:", this.bookingDetails.hotel);
      return this.bookingDetails.hotel || {}; // Trả về đối tượng rỗng nếu không có giá trị
    },
    selectedRoom() {
      console.log("Selected Room:", this.bookingDetails.room);
      return this.bookingDetails.room || {}; // Trả về đối tượng rỗng nếu không có giá trị
    },
    formattedStartDate() {
      const startDate = this.bookingDetails.startDate
        ? new Date(this.bookingDetails.startDate).toLocaleDateString()
        : "N/A";
      console.log("Formatted Start Date:", startDate);
      return startDate;
    },
    formattedEndDate() {
      const endDate = this.bookingDetails.endDate
        ? new Date(this.bookingDetails.endDate).toLocaleDateString()
        : "N/A";
      console.log("Formatted End Date:", endDate);
      return endDate;
    },
    nightsCount() {
      console.log("Nights Count:", this.bookingDetails.nightsCount);
      return this.bookingDetails.nightsCount || 1;
    },
    totalDays() {
      // Tổng số ngày dựa trên `nightsCount` lấy từ store, thêm 1 để tính luôn ngày bắt đầu
      return this.nightsCount + 1;
    },
    totalPrice() {
      let total = 0;

      // Tính tổng giá cho các phòng từ selectedRooms (giỏ hàng)
      if (this.selectedRooms.length > 0) {
        total += this.selectedRooms.reduce((sum, room) => {
          const nights = this.calculateNights(room.startDate, room.endDate);
          return sum + room.pricePerNight * nights;
        }, 0);
      }

      // Tính tổng giá cho phòng đặt ngay từ bookingDetails
      if (this.selectedRoom && this.selectedRoom._id) {
        const nights = this.calculateNights(
          this.bookingDetails.startDate,
          this.bookingDetails.endDate
        );
        total += this.selectedRoom.PRICE_PERNIGHT * nights;
      }

      return total;
    },
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
  },

  methods: {
    calculateTotalDays(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Thêm 1 vào kết quả để tính luôn ngày bắt đầu
      return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    },

    calculateNights(startDate, endDate) {
      const totalDays = this.calculateTotalDays(startDate, endDate);
      // Số đêm sẽ là số ngày trừ đi 1
      return totalDays - 1;
    },

    formatDate(date) {
      const d = new Date(date);
      return d.toLocaleDateString();
    },

    validateInput() {
      // Kiểm tra các trường hợp bắt buộc
      this.errors.customerName = this.customerName ? "" : "Vui lòng nhập tên khách hàng.";
      this.errors.customerPhone = this.customerPhone ? "" : "Vui lòng nhập số điện thoại.";
      this.errors.citizenId = this.citizenId ? "" : "Vui lòng nhập số CCCD.";
      
      // Kiểm tra định dạng số điện thoại
      if (this.customerPhone && !/^\d{10}$/.test(this.customerPhone)) {
        this.errors.customerPhone = "Số điện thoại không hợp lệ. Vui lòng nhập số có 10 chữ số.";
      }
    },

    handleInput(field) {
      this.errors[field] = "";
    },

    async processPayment() {
      if (!this.isLoggedIn) {
        this.$router.push({
          name: "Login",
          query: { redirect: this.$route.fullPath },
        });
        return;
      }

      this.validateInput();

      // Nếu có lỗi, dừng lại và hiển thị lỗi
      if (
        this.errors.customerName ||
        this.errors.customerPhone ||
        this.errors.citizenId
      ) {
        return; // Không tiếp tục nếu có lỗi
      }

      if (!this.selectedRoom && this.selectedRooms.length === 0) {
        this.$toast.error("Vui lòng chọn phòng trước khi thanh toán.");
        return;
      }

      console.log("Selected Rooms:", this.selectedRooms);

      let paymentData;

      if (this.selectedRooms.length > 0) {
        paymentData = {
          roomsDetails: this.selectedRooms.map((room) => ({
            ROOM_ID: room.roomId || room.ROOM_ID,
            CUSTOMER_PHONE: this.customerPhone,
            CUSTOMER_NAME: this.customerName,
            CITIZEN_ID: this.citizenId,
            startDate: room.startDate,
            endDate: room.endDate,
          })),
        };
      } else if (this.selectedRoom) {
        paymentData = {
          roomDetails: {
            ROOM_ID: this.selectedRoom._id,
            CUSTOMER_PHONE: this.customerPhone,
            CUSTOMER_NAME: this.customerName,
            CITIZEN_ID: this.citizenId,
            startDate: this.bookingDetails.startDate,
            endDate: this.bookingDetails.endDate,
          },
        };
      }

      console.log("Payment Data to be sent:", paymentData);
      try {
        // Gọi API đặt phòng
        const response = await axiosClient.post(
          "/bookings/bookRoomNows",
          paymentData
        );

        if (response.data.success) {
          // Sau khi đặt phòng thành công, tạo URL thanh toán VNPAY
          const paymentResponse = await axiosClient.post(
            "/payments/create_payment_url",
            {
              id: response.data.booking._id,
              totalPrice: response.data.booking.TOTAL_PRICE,
            }
          );

          if (paymentResponse.data && paymentResponse.data.data.url) {
            window.open(paymentResponse.data.data.url, "_blank");
          } else {
            this.$toast.error("Không thể tạo liên kết thanh toán VNPAY.");
          }
        } else {
          this.$toast.error("Đặt phòng thất bại.");
        }
      } catch (error) {
        console.error("Lỗi khi đặt phòng:", error);
        this.$toast.error("Đặt phòng thất bại. Vui lòng thử lại.");
      }
    },
  },
};
</script>

<style scoped>
/* .payment-container h1 {
  font-weight: 900;
  font-size: 30px;
  color: #6a2410;
} */

.payment-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 50px;
}

.customer-info {
  width: 70%;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
}

.customer-info h2 {
  font-weight: 700;
  font-size: 18px;
  line-height: normal;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dddddd;
}

.customer-info label {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 5px;
}

.customer-info input {
  height: 45px;
  background: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 3px;
  outline: none;
  font-size: 16px;
  padding: 5px 15px;
  margin-bottom: 5px;
}

.right-booking-info {
  width: 28%;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  position: sticky;
  top: 85px;
  height: auto; /* Để chiều cao co dãn theo nội dung */
  align-self: flex-start;
}

.booking-info h3 {
  font-weight: 700;
  font-size: 20px;
  line-height: normal;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dddddd;
}

.booking-info h4 {
  font-weight: 700;
  font-size: 18px;
  line-height: normal;
  margin-bottom: 15px;
}

.hotel-name-booking {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 10px;
}

.time {
  border-bottom: 1px dashed #ddd;
  padding-bottom: 15px;
}

.price {
  font-weight: bold;
  color: #a06e5c;
}

.total-info-book {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  font-weight: bold;
}

.total-book {
  font-size: 20px;
  color: #6a2410;
}

.confirm-booking-btn {
  width: 100%;
  background-color: #a06e5c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

.confirm-booking-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.invalid-feedback {
  color: #dc3545; /* Màu đỏ cho thông báo lỗi */
  font-size: 0.875em; /* Kích thước chữ nhỏ hơn */
  margin-top: 5px; /* Khoảng cách giữa trường nhập liệu và thông báo lỗi */
  margin-bottom: 50px;
  display: block; /* Hiển thị như khối để tách biệt */
  position: absolute; /* Đặt vị trí tuyệt đối để dễ dàng điều chỉnh */
  top: 100%; /* Đặt thông báo lỗi ngay dưới trường nhập liệu */
  left: 0; /* Căn trái cho thông báo lỗi */
}

.form-group {
  margin-bottom: 25px; /* Tạo khoảng cách giữa các nhóm */
  position: relative; /* Đặt vị trí tương đối cho nhóm để có thể dễ dàng xử lý */
}


.form-control {
  height: 45px;
  background: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 3px;
  outline: none;
  font-size: 16px;
  padding: 5px 15px;
  margin-bottom: 5px; /* Khoảng cách giữa trường nhập liệu và thông báo lỗi */
}

/* Thay đổi vị trí label khi có lỗi */
.is-invalid {
  border-color: #dc3545; /* Đỏ cho trường hợp lỗi */
}

</style>
