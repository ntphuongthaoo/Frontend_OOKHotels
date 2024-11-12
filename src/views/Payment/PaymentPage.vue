<template>
  <div class="payment-wrapper">
    <!-- Thông tin khách hàng bên trái -->
    <div class="customer-info">
      <h2>Thông tin người đặt phòng</h2>

      <!-- Dịch vụ đưa rước sân bay -->
      <div class="service-option">
        <label class="service-label">
          <input
            type="checkbox"
            v-model="airportPickup"
            @change="updateTotalPrice"
          />
          <span>Dịch vụ đưa rước sân bay (+ 200,000 VND)</span>
        </label>
      </div>

      <!-- Form thông tin khách hàng -->
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

      <!-- Chính sách đặt phòng -->
      <div class="booking-policy">
        <h3>Chính sách đặt phòng</h3>
        <ul>
          <li>
            <strong>Hủy:</strong> Nếu hủy, thay đổi hoặc không đến, khách sẽ trả
            toàn bộ giá trị tiền đặt phòng.
          </li>
          <li>
            <strong>Thanh toán:</strong> Thanh toán toàn bộ giá trị tiền đặt
            phòng.
          </li>
          <li><strong>Đã bao gồm:</strong> Ăn sáng.</li>
        </ul>
      </div>
    </div>

    <!-- Thông tin phòng đã chọn bên phải -->
    <div class="right-booking-info">
      <div class="booking-info">
        <h3>Thông tin đặt phòng</h3>

        <!-- Danh sách phòng -->
        <div v-if="selectedRooms && selectedRooms.length > 0">
          <div
            v-for="(room, index) in formattedRooms"
            :key="index"
            class="room-section"
          >
            <p class="hotel-name-booking">{{ room.hotelName }}</p>
            <p class="time">
              Nhận phòng: Từ 14h00 {{ room.formattedStartDate }}<br />
              Trả phòng: 12h00 {{ room.formattedEndDate }}<br />
              ({{ calculateTotalDays(room.startDate, room.endDate) }} ngày,
              {{ calculateNights(room.startDate, room.endDate) }} đêm)
            </p>
            <h4>Thông tin phòng</h4>
            <p>
              <b>Phòng:</b> {{ room.type }} 
            </p>
            <p>
              <b>Số phòng:</b> {{ room.roomNumber }}              
            </p>
            <p><b>Số người:</b> {{ room.number_of_people }}</p>
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
            Nhận phòng: Từ 14h00 {{ formatCheckInDate(bookingDetails.startDate)
            }}<br />
            Trả phòng: 12h00 {{ formatCheckOutDate(bookingDetails.endDate)
            }}<br />
            ({{
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

        <!-- Áp dụng mã voucher -->
        <div class="form-group voucher">
          <label for="voucherCode">Mã khuyến mãi</label>
          <div class="input-group">
            <input
              id="voucherCode"
              type="text"
              v-model="voucherCode"
              class="form-control"
              placeholder="Nhập mã khuyến mãi"
            />
            <button @click="applyVoucher" class="apply-voucher-btn">
              Áp dụng
            </button>
          </div>
          <div v-if="voucherMessage" class="voucher-feedback">
            {{ voucherMessage }}
          </div>
        </div>

        <div class="total-info-book">
          <div>Tổng tiền phòng:</div>
          <div>{{ totalPrice.toLocaleString() }} VNĐ</div>
        </div>

        <div class="voucher-info-book" v-if="voucherDiscount > 0">
          <div>Giảm giá mã {{ voucherCode }}:</div>
          <div>-{{ voucherDiscount.toLocaleString() }} VNĐ</div>
        </div>

        <div class="total-info-book final">
          <div>Tổng cộng:</div>
          <div class="total-book">
            {{ finalTotalPrice.toLocaleString() }} VNĐ
          </div>
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
      airportPickup: false, // Thêm biến để theo dõi dịch vụ đưa rước sân bay
      airportPickupPrice: 200000,
      errors: {
        customerName: "",
        customerPhone: "",
        citizenId: "",
      },
      voucherCode: "", // Mã giảm giá
      voucherDiscount: 0,
      voucherMessage: "",
    };
  },
  created() {
    this.selectedRooms = this.$store.getters.getSelectedRoomsCart;
    console.log(
      "Dữ liệu phòng từ Store trong PaymentPage:",
      this.selectedRooms
    );
    this.bookingDetails = this.$store.getters.getBookingDetails;

    // Kiểm tra nếu không có phòng nào được chọn
    if (
      (!this.selectedRooms || this.selectedRooms.length === 0) &&
      (!this.bookingDetails || !this.bookingDetails.room)
    ) {
      // Kiểm tra nếu có bookingDetails và bookingDetails.hotel
      if (this.bookingDetails && this.bookingDetails.hotel) {
        this.$router.push({
          name: "HotelDetail",
          params: { id: this.bookingDetails.hotel._id },
        });
      } else {
        // Nếu không có bookingDetails.hotel, chuyển hướng về trang chủ
        this.$router.push({ path: "/home" });
      }
    }
  },
  computed: {
    selectedRooms() {
      return this.$store.getters.getSelectedRoomsCart;
    },
    formattedRooms() {
      return this.selectedRooms.map((room) => ({
        ...room,
        formattedStartDate: this.formatDate(room.startDate),
        formattedEndDate: this.formatDate(room.endDate),
        totalDays: this.calculateTotalDays(room.startDate, room.endDate),
        nights: this.calculateNights(room.startDate, room.endDate),
      }));
    },
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
      // Tính tổng tiền trước khi áp dụng voucher
      let total = 0;
      if (this.selectedRooms.length > 0) {
        total += this.selectedRooms.reduce((sum, room) => {
          const nights = this.calculateNights(room.startDate, room.endDate);
          return sum + room.pricePerNight * nights;
        }, 0);
      }
      if (this.selectedRoom && this.selectedRoom._id) {
        const nights = this.calculateNights(
          this.bookingDetails.startDate,
          this.bookingDetails.endDate
        );
        total += this.selectedRoom.PRICE_PERNIGHT * nights;
      }
      if (this.airportPickup) {
        total += this.airportPickupPrice;
      }
      return total; // Tổng tiền chưa áp dụng voucher
    },
    finalTotalPrice() {
      // Tính tổng cộng sau khi áp dụng voucher
      return this.totalPrice - this.voucherDiscount;
    },
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
  },

  methods: {
    async applyVoucher() {
      if (!this.voucherCode) {
        this.voucherMessage = "Vui lòng nhập mã khuyến mãi.";
        return;
      }

      let totalNights = 0;

      // Kiểm tra nếu có nhiều phòng được chọn từ giỏ hàng
      if (this.selectedRooms && this.selectedRooms.length > 0) {
        // Tính tổng số đêm cho từng phòng trong giỏ hàng
        totalNights = this.selectedRooms.reduce((sum, room) => {
          const nights = this.calculateNights(room.startDate, room.endDate);
          return sum + nights;
        }, 0);
      } else if (
        this.bookingDetails &&
        this.bookingDetails.startDate &&
        this.bookingDetails.endDate
      ) {
        // Trường hợp đặt một phòng từ RoomDetail hoặc Booking
        totalNights = this.calculateNights(
          this.bookingDetails.startDate,
          this.bookingDetails.endDate
        );
      }

      // Tạo đối tượng `bookingDetails` để gửi đi với tổng số đêm chính xác
      const bookingDetails = {
        nights: totalNights,
        totalPrice: this.totalPrice,
        roomType: this.selectedRoom.TYPE,
        hotelId: this.hotel._id,
      };

      try {
        const response = await axiosClient.post("/vouchers/apply", {
          code: this.voucherCode,
          bookingDetails,
        });
        if (response.data && response.data.discountAmount) {
          this.voucherDiscount = response.data.discountAmount;
          this.voucherMessage = "Voucher áp dụng thành công!";
        }
      } catch (error) {
        console.error("Error:", error.response?.data?.error || error.message);
        this.voucherMessage =
          error.response?.data?.error || "Lỗi khi áp dụng voucher.";
      }
    },

    updateTotalPrice() {
      // Chỉ cần tính lại tổng giá khi có sự thay đổi trong dịch vụ đưa rước sân bay
      this.totalPrice = this.totalPrice; // Kích hoạt tính toán lại computed property
    },
    formatCheckInDate(date) {
      const d = new Date(date);
      const dayOfWeek = d.toLocaleDateString("vi-VN", { weekday: "long" });
      const formattedDate = d.toLocaleDateString("vi-VN");
      return `${dayOfWeek}, ${formattedDate}`;
    },

    // Định dạng ngày trả phòng
    formatCheckOutDate(date) {
      const d = new Date(date);
      const dayOfWeek = d.toLocaleDateString("vi-VN", { weekday: "long" });
      const formattedDate = d.toLocaleDateString("vi-VN");
      return `${dayOfWeek}, ${formattedDate}`;
    },
    calculateTotalDays(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1; // Tính cả ngày bắt đầu và ngày kết thúc
    },
    // calculateNights(startDate, endDate) {
    //   return this.calculateTotalDays(startDate, endDate) - 1; // Đêm = ngày - 1
    // },
    calculateNights(startDate, endDate) {
      if (!startDate || !endDate) return 0; // Trường hợp không có ngày bắt đầu/kết thúc
      const start = new Date(startDate);
      const end = new Date(endDate);
      return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24))); // Tính số đêm
    },

    // formatDate(date) {
    //   const d = new Date(date);
    //   return d.toLocaleDateString();
    // },

    formatDate(date) {
      const d = new Date(date);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    validateInput() {
      // Kiểm tra các trường hợp bắt buộc
      this.errors.customerName = this.customerName
        ? ""
        : "Vui lòng nhập tên khách hàng.";
      this.errors.customerPhone = this.customerPhone
        ? ""
        : "Vui lòng nhập số điện thoại.";
      this.errors.citizenId = this.citizenId ? "" : "Vui lòng nhập số CCCD.";

      // Kiểm tra định dạng số điện thoại
      if (this.customerPhone && !/^\d{10}$/.test(this.customerPhone)) {
        this.errors.customerPhone =
          "Số điện thoại không hợp lệ. Vui lòng nhập số có 10 chữ số.";
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
          airportPickup: this.airportPickup,
          TOTAL_PRICE: this.finalTotalPrice,
          VOUCHER: {
            VOUCHER_CODE: this.voucherCode || null,
            DISCOUNT_AMOUNT: this.voucherDiscount || 0,
          },
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
          airportPickup: this.airportPickup,
          TOTAL_PRICE: this.finalTotalPrice,
          VOUCHER: {
            VOUCHER_CODE: this.voucherCode || null,
            DISCOUNT_AMOUNT: this.voucherDiscount || 0,
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
              totalPrice: this.finalTotalPrice,
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
  color: #a06e5c;
}

.time {
  border-bottom: 1px dashed #ddd;
  padding-bottom: 15px;
  font-weight: 600;
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

.booking-policy {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.booking-policy h3 {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
}

.booking-policy ul {
  list-style-type: none;
  padding: 0;
}

.booking-policy li {
  margin-bottom: 5px;
  font-size: 14px;
}

.service-option {
  margin-top: 15px;
  display: flex;
  align-items: center;
}

.service-label {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.service-label input {
  margin-right: 8px; /* Khoảng cách giữa checkbox và văn bản */
}

.service-label span {
  font-size: 16px;
}

.voucher {
  margin-top: 20px;
}

.input-group {
  display: flex;
}

.apply-voucher-btn {
  background-color: #a06e5c;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

.voucher-feedback {
  color: green;
  font-size: 14px;
  margin-top: 5px;
}

.voucher-info-book {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-weight: bold;
  color: #6a2410;
}

.total-info-book.final {
  font-size: 20px;
  color: #6a2410;
}
</style>
