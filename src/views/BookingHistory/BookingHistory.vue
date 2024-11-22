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
                'status-failed': booking.STATUS === 'PaymentUnsuccessful',
                'status-checkedin': booking.STATUS === 'CheckedIn',
                'status-canceled': booking.STATUS === 'Canceled',
                'status-checkedout': booking.STATUS === 'CheckedOut',
              }"
            >
              {{
                booking.STATUS === "NotYetPaid"
                  ? "Chưa thanh toán"
                  : booking.STATUS === "Booked"
                  ? "Đã thanh toán"
                  : booking.STATUS === "PaymentUnsuccessful"
                  ? "Thanh toán không thành công"
                  : booking.STATUS === "CheckedIn"
                  ? "Đã nhận phòng"
                  : booking.STATUS === "Canceled"
                  ? "Đã hủy"
                  : booking.STATUS === "CheckedOut"
                  ? "Đã trả phòng"
                  : "Không xác định"
              }}
            </span>
          </p>
        </div>

        <div class="total-price">
          <div class="voucher-info" v-if="booking.VOUCHER">
            <p v-if="booking.VOUCHER.VOUCHER_CODE">
              <strong>Voucher:</strong> {{ booking.VOUCHER.VOUCHER_CODE }}
            </p>
            <p v-if="booking.VOUCHER.DISCOUNT_AMOUNT">
              <strong>Giảm giá:</strong>
              {{ booking.VOUCHER.DISCOUNT_AMOUNT.toLocaleString() }} VND
            </p>
          </div>
          <div class="voucher-info" v-else>
            <p><em>Không có voucher áp dụng</em></p>
          </div>

          <p>
            <strong>Tổng giá:</strong>
            {{ (booking.TOTAL_PRICE - (booking.VOUCHER?.DISCOUNT_AMOUNT || 0)).toLocaleString() }} VND
          </p>

          <!-- Điều kiện hiển thị nút dựa trên trạng thái và thời gian đặt phòng -->
          <div class="action-buttons">
            <!-- Nút Hủy đặt phòng -->
            <div
              v-if="
                booking.STATUS === 'Booked' &&
                new Date() <= new Date(booking.LIST_ROOMS[0].END_DATE)
              "
            >
              <button @click="cancelBooking(booking._id)" class="cancel-button">
                Hủy đặt phòng
              </button>
            </div>

            <!-- Nút Thanh toán ngay -->
            <div
              v-if="
                booking.STATUS === 'NotYetPaid' && !booking.hidePaymentButton
              "
            >
              <button
                @click="redirectToPayment(booking._id)"
                class="pay-now-button"
              >
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hiển thị chi tiết khách sạn và phòng đã đặt -->
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

              <div class="review-buttons">
                <!-- Nút Xem Đánh giá -->
                <button
                  class="review-button"
                  v-if="
                    room.hasReview &&
                    (booking.STATUS === 'Booked' ||
                      booking.STATUS === 'CheckedOut')
                  "
                  @click="viewReview(room, booking._id)"
                >
                  <i class="fa fa-eye" aria-hidden="true"></i> Xem đánh giá
                </button>

                <!-- Nút Viết Đánh giá -->
                <button
                  class="review-button write-review"
                  v-else-if="
                    !room.hasReview &&
                    new Date(room.END_DATE) <= new Date() &&
                    (booking.STATUS === 'Booked' ||
                      booking.STATUS === 'CheckedOut')
                  "
                  @click="openReviewModal(room, booking._id)"
                >
                  <i class="fa fa-star" aria-hidden="true"></i> Viết đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal cho phần đánh giá -->
    <div v-if="showReviewModal" class="review-modal">
      <div class="review-header">
        <h2>{{ review.editing ? "Chỉnh sửa đánh giá" : "Đánh giá phòng" }}</h2>
        <span class="close-button" @click="closeReviewModal">&#10005;</span>
      </div>

      <div class="room-info">
        <img
          :src="review.room.ROOM_ID.IMAGES[0]"
          alt="Room Image"
          class="room-image"
        />
        <div class="room-details">
          <p><strong>Phòng:</strong> {{ review.room.ROOM_ID.TYPE }}</p>
          <p>
            <strong>Số phòng:</strong> {{ review.room.ROOM_ID.ROOM_NUMBER }}
          </p>
          <p><strong>Tầng:</strong> {{ review.room.ROOM_ID.FLOOR }}</p>
          <p>
            <strong>Giá mỗi đêm:</strong>
            {{ review.room.ROOM_ID.PRICE_PERNIGHT.toLocaleString() }} VND
          </p>
        </div>
      </div>

      <div class="rating-section">
        <h3>Đánh giá của bạn</h3>
        <div class="star-rating">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ selected: star <= review.rating }"
            @click="selectRating(star)"
          >
            &#9733;
          </span>
        </div>
      </div>

      <textarea
        class="review-comment"
        placeholder="Viết nhận xét của bạn..."
        v-model="review.comment"
      ></textarea>

      <button @click="submitReview" class="submit-review-btn">
        {{ review.editing ? "Cập nhật đánh giá" : "Gửi đánh giá" }}
      </button>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      bookings: [],
      paymentStatus: null,
      showReviewModal: false,
      review: {
        editing: false,
        id: null,
        rating: null,
        comment: "",
        room: null,
        roomId: null,
        bookingId: null,
      },
      paymentTimeout: null,
    };
  },
  created() {
    this.fetchBookings();
    this.checkPaymentStatus();
  },
  methods: {
    viewReview(room, bookingId) {
      this.$router.push({
        name: "RoomDetail",
        params: { id: room.ROOM_ID._id },
        query: { roomId: room.ROOM_ID._id, bookingId: bookingId },
      });
    },

    async fetchBookings() {
      try {
        const response = await axiosClient.get("/bookings/getBookingHistory");
        if (response.data.success) {
          this.bookings = response.data.formattedBookings.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          // Mảng promises để chứa tất cả các yêu cầu kiểm tra đánh giá
          const reviewPromises = [];

          // Duyệt qua từng phòng và tạo yêu cầu kiểm tra đánh giá
          for (const booking of this.bookings) {
            for (const hotel of booking.hotels) {
              for (const room of hotel.rooms) {
                const reviewPromise = axiosClient
                  .post("/reviews/getReviewByUserAndRoom", {
                    roomId: room.ROOM_ID._id,
                    bookingId: booking._id,
                  })
                  .then((reviewResponse) => {
                    room.hasReview =
                      reviewResponse.data.success && reviewResponse.data.review
                        ? true
                        : false;
                  })
                  .catch((error) => {
                    console.error("Lỗi khi kiểm tra đánh giá:", error);
                    room.hasReview = false;
                  });
                reviewPromises.push(reviewPromise);
              }
            }
          }

          // Chờ tất cả các yêu cầu kiểm tra đánh giá hoàn tất
          await Promise.all(reviewPromises);

          // Thiết lập thời gian thanh toán cho mỗi đơn đặt phòng
          this.bookings.forEach((booking) => {
            // Kiểm tra xem CREATED_AT có tồn tại và không null
            if (booking.createdAt) {
              // Chuyển đổi createdAt thành đối tượng Date
              const createdAt = new Date(booking.createdAt).getTime(); // Lưu ý: đã chuyển đổi đúng
              const currentTime = new Date().getTime();

              // Kiểm tra nếu đã qua 20 phút (1200000 milliseconds)
              if (currentTime - createdAt > 20 * 60 * 1000) {
                booking.hidePaymentButton = true; // Ẩn nút thanh toán
              } else {
                booking.hidePaymentButton = false; // Hiển thị nút thanh toán
              }
            } else {
              console.warn(
                "createdAt không hợp lệ hoặc không tồn tại",
                booking
              );
            }
          });
        } else {
          console.error("Lỗi: Không lấy được lịch sử đặt phòng");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    },

    async cancelBooking(bookingId) {
      const result = await Swal.fire({
        title: "Xác nhận",
        text: "Bạn có chắc chắn muốn hủy đặt phòng này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Có, hủy đặt phòng!",
        cancelButtonText: "Không",
      });

      if (result.isConfirmed) {
        try {
          const response = await axiosClient.put(
            `/bookings/cancelBooking/${bookingId}`
          );

          if (response.data.success) {
            Swal.fire(
              "Thành công",
              "Đặt phòng đã được hủy thành công.",
              "success"
            );
            this.fetchBookings();
          } else {
            Swal.fire(
              "Lỗi",
              response.data.message || "Không thể hủy đặt phòng.",
              "error"
            );
          }
        } catch (error) {
          Swal.fire("Lỗi", "Không thể kết nối đến server.", "error");
          console.error("Lỗi khi hủy đặt phòng:", error);
        }
      }
    },
    redirectToPayment(bookingId) {
      // Lấy URL thanh toán từ localStorage
      const vnpayUrl = localStorage.getItem("vnpayUrl");

      if (vnpayUrl) {
        // Nếu URL tồn tại trong localStorage, điều hướng người dùng đến đó
        window.open(vnpayUrl, "_blank");
      } else {
        // Nếu không có URL trong localStorage, tạo lại URL thanh toán VNPAY
        axiosClient
          .post("/payments/create_payment_url", { id: bookingId })
          .then((response) => {
            if (response.data && response.data.data.url) {
              // Lưu URL vào localStorage và điều hướng
              const paymentUrl = response.data.data.url;
              localStorage.setItem("vnpayUrl", paymentUrl);
              window.location.href = paymentUrl;
            } else {
              this.$toast.error("Không thể tạo liên kết thanh toán VNPAY.");
            }
          })
          .catch((error) => {
            console.error("Lỗi khi tạo liên kết thanh toán:", error);
            this.$toast.error("Không thể kết nối đến server.");
          });
      }
    },
    checkPaymentStatus() {
      const queryParams = new URLSearchParams(window.location.search);
      const success = queryParams.get("success");

      if (success === "true") {
        this.paymentStatus = "success";
      } else if (success === "false") {
        this.paymentStatus = "fail";
      }
    },
    openReviewModal(room, bookingId) {
      this.review.room = room;
      this.review.bookingId = bookingId; // Gán bookingId khi mở modal đánh giá
      this.review.roomId = room.ROOM_ID._id; // Sử dụng ROOM_ID từ LIST_ROOMS
      this.showReviewModal = true;
      this.review.rating = null;
      this.review.comment = "";
      this.checkExistingReview(room.ROOM_ID._id, bookingId); // Kiểm tra đánh giá hiện tại
    },
    closeReviewModal() {
      this.showReviewModal = false;
      this.review.rating = null;
      this.review.comment = "";
    },
    selectRating(star) {
      this.review.rating = star; // Gán giá trị đánh giá
    },
    highlightStars(rating) {
      const stars = document.querySelectorAll(".star");
      stars.forEach((star) => {
        if (star.getAttribute("data-value") <= rating) {
          star.classList.add("selected");
        } else {
          star.classList.remove("selected");
        }
      });
    },
    async checkExistingReview(roomId, bookingId) {
      try {
        const response = await axiosClient.post(
          "/reviews/getReviewByUserAndRoom",
          {
            roomId: roomId,
            bookingId: bookingId,
          }
        );
        if (response.data.success) {
          const reviewData = response.data.review;
          this.review.rating = reviewData.RATING;
          this.review.comment = reviewData.COMMENT;
          this.review.editing = true; // Bật chế độ chỉnh sửa nếu đã có đánh giá
          this.review.exists = true;
        } else {
          this.review.exists = false;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra đánh giá:", error);
      }
    },
    async submitReview() {
      try {
        const response = await axiosClient.post("/reviews/addReview", {
          bookingId: this.review.bookingId, // Gửi bookingId trong payload
          roomId: this.review.roomId, // Gửi roomId
          rating: this.review.rating,
          comment: this.review.comment,
        });

        if (response.data.success) {
          Swal.fire("Thành công", "Cảm ơn bạn đã đánh giá!", "success");
          this.closeReviewModal();
        } else {
          Swal.fire(
            "Lỗi",
            response.data.msg || "Có lỗi xảy ra khi gửi đánh giá.",
            "error"
          );
        }
      } catch (error) {
        console.error("Lỗi khi gửi đánh giá:", error);
        Swal.fire("Lỗi", "Không thể kết nối đến server.", "error");
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
  position: relative;
}

.room-image {
  width: 250px;
  border-radius: 15px;
  padding: 10px 10px;
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
  color: #28a745; /* Xanh lá cây cho trạng thái 'Booked' */
}

.status-unpaid {
  color: #dc3545; /* Đỏ cho trạng thái 'NotYetPaid' */
}

.status-failed {
  color: #ffc107; /* Vàng cho trạng thái 'PaymentUnsuccessful' */
}

.status-checkedin {
  color: #17a2b8; /* Xanh da trời cho trạng thái 'CheckedIn' */
}

.status-canceled {
  color: #6c757d; /* Xám cho trạng thái 'Canceled' */
}

.status-checkedout {
  color: #007bff; /* Xanh dương cho trạng thái 'CheckedOut' */
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

.review {
  display: flex;
  justify-content: end;
}
.review-modal {
  background-color: #fff;
  width: 500px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.review-header h2 {
  font-size: 24px;
  color: #6d4c41;
}

.close-button {
  cursor: pointer;
  font-size: 20px;
}

.room-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.room-details p {
  margin: 5px 0;
  font-size: 16px;
  color: #6d4c41;
}

.rating-section {
  margin-top: 15px;
}

.star-rating {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.star {
  font-size: 30px;
  color: #e0e0e0;
  cursor: pointer;
  transition: color 0.2s;
}

.star.selected {
  color: #ffcc00;
}

.review-comment {
  width: 100%;
  height: 100px;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: none;
  font-size: 16px;
  color: #333;
}

.submit-review-btn {
  width: 100%;
  padding: 12px;
  background-color: #6d4c41;
  color: #fff;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.3s;
}

.submit-review-btn:hover {
  background-color: #5b3b33;
}

.cancel-booking {
  margin-top: 10px;
  text-align: right;
}

.cancel-button {
  background-color: #dc3545; /* Màu đỏ */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #c82333; /* Màu đỏ đậm hơn khi hover */
}

.pay-now-button {
  background-color: #81cd93; /* Màu đỏ */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pay-now-button:hover {
  background-color: #6d4c41; /* Màu đỏ */
  color: rgb(231, 197, 113);
}

.review-buttons {
  display: flex;
  justify-content: center; /* Căn giữa các nút */
  gap: 20px; /* Khoảng cách giữa các nút */
  margin-top: 15px; /* Khoảng cách phía trên */
}

.review-button {
  background: linear-gradient(90deg, #ff7e5f, #feb47b);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* Khoảng cách giữa icon và text */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.review-button i {
  font-size: 16px;
}

.review-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.3);
}

.review-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.review-button.write-review {
  background: linear-gradient(90deg, #43cea2, #185a9d);
}

.review-button.write-review:hover {
  background: linear-gradient(90deg, #185a9d, #43cea2);
}
</style>
