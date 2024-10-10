<template>
  <div class="booking-history">
    <h2 class="title">Lịch sử Đặt Phòng</h2>

    <!-- Hiển thị thông báo kết quả thanh toán -->
    <div v-if="paymentStatus === 'success'" class="alert alert-success">
      Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.
    </div>
    <div v-else-if="paymentStatus === 'fail'" class="alert alert-danger">
      Thanh toán thất bại. Vui lòng thử lại sau.
    </div>

    <!-- Hiển thị danh sách lịch sử đặt phòng -->
    <div v-for="booking in bookings" :key="booking._id" class="booking-card">
      <div class="booking-header">
        <div class="booking-info">
          <p><strong>Tên khách hàng:</strong> {{ booking.CUSTOMER_NAME }}</p>
          <p><strong>Số điện thoại:</strong> {{ booking.CUSTOMER_PHONE }}</p>
          <p>
            <strong>Trạng thái:</strong>
            <span
              :class="{
                'status-paid': booking.STATUS === 'Booked',
                'status-unpaid': booking.STATUS === 'NotYetPaid',
              }"
            >
              {{
                booking.STATUS === "Booked"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"
              }}
            </span>
          </p>
        </div>
        <div class="total-price">
          <p>
            <strong>Tổng giá:</strong>
            {{ booking.TOTAL_PRICE.toLocaleString() }} VND
          </p>
        </div>
      </div>

      <div
        v-for="hotel in booking.hotels"
        :key="hotel.rooms[0].ROOM_ID.HOTEL_ID._id"
        class="hotel-section"
      >
        <div class="hotel-header">
          <h2>{{ hotel.rooms[0].ROOM_ID.HOTEL_ID.NAME }}</h2>
          <p>{{ hotel.hotelAddress }}</p>
        </div>
        <div class="room-list">
          <div
            v-for="room in hotel.rooms"
            :key="room.ROOM_ID._id"
            class="room-item"
          >
            <img
              :src="room.ROOM_ID.IMAGES[0]"
              alt="Room Image"
              class="room-image"
            />
            <div class="room-details">
              <p><strong>Số phòng:</strong> {{ room.ROOM_ID.ROOM_NUMBER }}</p>
              <p><strong>Loại:</strong> {{ room.ROOM_ID.TYPE }}</p>
              <p><strong>Tầng:</strong> {{ room.ROOM_ID.FLOOR }}</p>
              <p>
                <strong>Giá mỗi đêm:</strong>
                {{ room.ROOM_ID.PRICE_PERNIGHT.toLocaleString() }} VND
              </p>
              <p>
                <strong>Ngày nhận phòng:</strong>
                {{ new Date(room.START_DATE).toLocaleDateString() }}
              </p>
              <p>
                <strong>Ngày trả phòng:</strong>
                {{ new Date(room.END_DATE).toLocaleDateString() }}
              </p>

              <!-- Hiển thị nút đánh giá nếu ngày trả phòng đã đến -->
              <div v-if="new Date(room.END_DATE) <= new Date()">
                <button @click="openReviewModal(room)">Đánh giá</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal cho phần đánh giá -->
    <div v-if="showReviewModal" class="review-container">
      <h2 class="review-title">Đánh giá phòng</h2>

      <div class="rating">
        <span class="star" data-value="1">&#9733;</span>
        <span class="star" data-value="2">&#9733;</span>
        <span class="star" data-value="3">&#9733;</span>
        <span class="star" data-value="4">&#9733;</span>
        <span class="star" data-value="5">&#9733;</span>
      </div>

      <textarea
        class="review-text"
        placeholder="Nhận xét của bạn..."
      ></textarea>

      <button class="submit-review">Gửi đánh giá</button>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";

export default {
  data() {
    return {
      bookings: [],
      paymentStatus: null, // Trạng thái thanh toán
      showReviewModal: false,
      review: {
        rating: null,
        comment: "",
        room: null, // Lưu thông tin phòng đang được đánh giá
      },
    };
  },
  created() {
    this.fetchBookings();
    this.checkPaymentStatus(); // Kiểm tra trạng thái thanh toán
  },
  methods: {
    async fetchBookings() {
      try {
        const response = await axiosClient.get("/bookings/getBookingHistory");
        if (response.data.success) {
          this.bookings = response.data.formattedBookings; // Lưu dữ liệu trả về
        } else {
          console.error("Lỗi: Không lấy được lịch sử đặt phòng");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    },
    checkPaymentStatus() {
      // Lấy trạng thái thanh toán từ URL query
      const queryParams = new URLSearchParams(window.location.search);
      const success = queryParams.get("success");

      if (success === "true") {
        this.paymentStatus = "success";
      } else if (success === "false") {
        this.paymentStatus = "fail";
      }
    },
    openReviewModal(room) {
      this.review.room = room; // Lưu phòng được đánh giá
      this.showReviewModal = true; // Hiển thị modal đánh giá
      this.review.rating = null; // Reset rating
      this.review.comment = ""; // Reset comment
    },
    closeReviewModal() {
      this.showReviewModal = false; // Đóng modal đánh giá
      this.review.rating = null; // Reset rating
      this.review.comment = ""; // Reset comment
    },
    selectRating(star) {
      this.review.rating = star; // Lưu rating đã chọn
      this.highlightStars(star); // Làm nổi bật các ngôi sao
    },
    highlightStars(rating) {
      const stars = document.querySelectorAll('.star');
      stars.forEach(star => {
        if (star.getAttribute('data-value') <= rating) {
          star.classList.add('selected'); // Thêm lớp 'selected'
        } else {
          star.classList.remove('selected'); // Xóa lớp 'selected'
        }
      });
    },
    async submitReview() {
      try {
        const response = await axiosClient.post("/reviews/addReview", {
          roomId: this.review.room.ROOM_ID._id,
          rating: this.review.rating,
          comment: this.review.comment,
        });
        if (response.data.success) {
          Swal.fire("Thành công", "Cảm ơn bạn đã đánh giá!", "success");
          this.closeReviewModal();
        } else {
          Swal.fire("Lỗi", "Có lỗi xảy ra khi gửi đánh giá.", "error");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        Swal.fire("Lỗi", "Có lỗi xảy ra khi gửi đánh giá.", "error");
      }
    },
  },
};
</script>

<style scoped>
.booking-history {
  padding: 20px;
  background-color: #f8f9fa;
}

.title {
  color: #6d4c41;
  font-size: 32px;
  text-align: center;
  margin-bottom: 20px;
}

.booking-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.booking-info p {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.total-price p {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #6d4c41;
}

.hotel-section {
  margin-top: 20px;
}

.hotel-header {
  background-color: #6d4c41;
  color: #fff;
  border-radius: 5px;
}

.room-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.room-item {
  display: flex;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-right: 20px;
  margin-bottom: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 48%;
}

.room-image {
  width: 250px;
  height: 185px;
  object-fit: cover;
  border-radius: 8px 0 0 8px;
}

.room-details {
  padding: 10px;
}

.room-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}

.status-paid {
  color: #28a745;
}

.status-unpaid {
  color: #dc3545;
}

.name-hotel {
  font-style: normal;
}

.hotel-section h2 {
  font-weight: 700;
  font-size: 20px;
  line-height: normal;
  margin-bottom: 15px;
  padding: 10px 10px;
  /* border-radius: 5px; */
}

.review-container {
  display: block; /* Hoặc flex, tùy thuộc vào cách bạn muốn hiển thị */
  position: fixed; /* Đặt modal ở giữa màn hình */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Căn giữa */
  z-index: 1000; /* Đảm bảo modal nằm trên các phần tử khác */
  background-color: white; /* Màu nền của modal */
  padding: 20px; /* Padding cho modal */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Đổ bóng */
}


.review-title {
  font-size: 24px; /* Kích thước chữ tiêu đề */
  color: #6d4c41; /* Màu nâu */
  text-align: center; /* Căn giữa */
}

.rating {
  display: flex; /* Hiển thị flex để căn giữa các ngôi sao */
  justify-content: center; /* Căn giữa */
  margin-bottom: 10px; /* Khoảng cách dưới */
}

.star {
  font-size: 30px; /* Kích thước ngôi sao */
  color: #e0e0e0; /* Màu ngôi sao chưa chọn */
  cursor: pointer; /* Con trỏ khi di chuột */
  transition: color 0.2s; /* Hiệu ứng chuyển màu */
}

.star:hover,
.star.selected {
  color: #ffcc00; /* Màu ngôi sao đã chọn */
}

.review-text {
  width: 100%; /* Chiều rộng đầy đủ */
  height: 100px; /* Chiều cao */
  padding: 10px; /* Padding */
  border: 1px solid #ddd; /* Đường viền nhẹ */
  border-radius: 5px; /* Bo tròn góc */
  resize: none; /* Không cho thay đổi kích thước */
}

.submit-review {
  background-color: #6d4c41; /* Màu nền nút */
  color: white; /* Màu chữ nút */
  border: none; /* Không có đường viền */
  border-radius: 5px; /* Bo tròn góc */
  padding: 10px 20px; /* Padding */
  cursor: pointer; /* Con trỏ khi di chuột */
  display: block; /* Hiển thị như khối */
  margin: 0 auto; /* Căn giữa */
}

</style>
