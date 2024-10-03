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
              required
              placeholder="Nhập tên khách hàng"
            />
          </div>
          <div class="form-group">
            <label for="customerPhone">Số điện thoại</label>
            <input
              id="customerPhone"
              type="text"
              v-model="customerPhone"
              class="form-control"
              required
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div class="form-group">
            <label for="citizenId">Số CCCD</label>
            <input
              id="citizenId"
              type="text"
              v-model="citizenId"
              class="form-control"
              required
              placeholder="Nhập số CCCD"
            />
          </div>
        </form>
      </div>

      <!-- Thông tin phòng đã chọn bên phải -->
      <div class="right-booking-info">
        <div class="booking-info">
          <h3>Thông tin đặt phòng</h3>

          <!-- Tên khách sạn -->
          <p class="hotel-name-booking">{{ hotel.NAME }}</p>

          <!-- Ngày nhận và trả phòng -->
          <p class="time">
            {{ formattedStartDate }} - {{ formattedEndDate }} ({{
              totalDays
            }}
            ngày, {{ nightsCount > 1 ? nightsCount + " đêm" : "1 đêm" }})
          </p>

          <!-- Thông tin phòng (khi người dùng đã chọn phòng) -->
          <h4>Thông tin phòng</h4>
          <div v-if="selectedRoom">
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
    };
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
      console.log("Total Price:", this.bookingDetails.totalPrice);
      return this.bookingDetails.totalPrice || 0;
    },
  },

  methods: {
    async processPayment() {
      console.log("Customer Name:", this.customerName);
      console.log("Customer Phone:", this.customerPhone);
      console.log("Citizen ID:", this.citizenId);
      if (!this.selectedRoom) {
        this.$toast.error("Vui lòng chọn phòng trước khi thanh toán.");
        return;
      }

      const paymentData = {
        roomDetails: {
          ROOM_ID: this.selectedRoom._id,
          CUSTOMER_PHONE: this.customerPhone,
          CUSTOMER_NAME: this.customerName,
          CITIZEN_ID: this.citizenId,
        },
        startDate: this.bookingDetails.startDate, // Lấy từ bookingDetails
        endDate: this.bookingDetails.endDate, // Lấy từ bookingDetails
      };

      try {
        const response = await axiosClient.post(
          "/bookings/bookRoomNow",
          paymentData
        );
        if (response.data.success) {
          this.$toast.success("Đặt phòng thành công!");
          // this.$router.push("/payment-success");
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
  margin-bottom: 10px;
}

.customer-info input {
  height: 45px;
  background: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 3px;
  outline: none;
  font-size: 16px;
  padding: 5px 15px;
  margin-bottom: 15px;
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
</style>
