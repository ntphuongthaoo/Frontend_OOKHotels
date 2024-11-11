<template>
  <div class="room-detail-container" v-if="room && room.CUSTOM_ATTRIBUTES">
    <!-- Tiêu đề trang -->
    <h1 class="page-title">
      {{ room.TYPE }} - {{ room.CUSTOM_ATTRIBUTES.bedType }}
    </h1>

    <!-- Phần hình ảnh của phòng -->
    <div class="image-gallery" v-if="room.IMAGES && room.IMAGES.length > 0">
      <div class="main-image-container">
        <img
          :src="room.IMAGES[mainImageIndex]"
          alt="Room Image"
          class="main-image"
        />
      </div>
      <div class="thumbnail-container">
        <img
          v-for="(image, index) in room.IMAGES"
          :key="index"
          :src="image"
          :class="{ 'active-thumbnail': mainImageIndex === index }"
          @click="changeMainImage(index)"
          alt="Thumbnail Image"
          class="thumbnail-image"
        />
      </div>
    </div>

    <!-- Phần thông tin chi tiết của phòng -->
    <div class="room-info">
      <h2 class="section-title">Thông tin phòng</h2>
      <div class="info-item">
        <strong>Số phòng:</strong> {{ room.ROOM_NUMBER }}
      </div>
      <div class="info-item"><strong>Loại phòng:</strong> {{ room.TYPE }}</div>
      <div class="info-item">
        <strong>Diện tích:</strong> {{ room.CUSTOM_ATTRIBUTES.area }} m²
      </div>
      <div class="info-item">
        <strong>Giá mỗi đêm:</strong>
        {{ room.PRICE_PERNIGHT.toLocaleString() }} VND
      </div>
      <div class="info-item">
        <strong>Loại giường:</strong> {{ room.CUSTOM_ATTRIBUTES.bedType }}
      </div>
      <div class="info-item">
        <strong>Tầm nhìn:</strong> {{ room.CUSTOM_ATTRIBUTES.view }}
      </div>
      <div class="info-item">
        <strong>Số người:</strong>
        {{ room.CUSTOM_ATTRIBUTES.number_of_people }} người
      </div>
      <div class="info-item">
        <strong>Tiện nghi:</strong> {{ room.CUSTOM_ATTRIBUTES.amenities }}
      </div>
      <div class="info-item">
        <strong>Mô tả:</strong> {{ room.DESCRIPTION }}
      </div>
    </div>

    <!-- Phần đánh giá -->
    <div class="reviews-section">
      <h2 class="section-title">Đánh giá</h2>
      <div class="tabs">
        <!-- Tab lựa chọn giữa "Tất cả đánh giá" và "Đánh giá của bạn" -->
        <span
          :class="{ activeTab: activeTab === 'all' }"
          @click="activeTab = 'all'"
          class="tab-option"
        >
          Tất cả đánh giá
        </span>
        <span
          :class="{ activeTab: activeTab === 'yours' }"
          @click="activeTab = 'yours'"
          class="tab-option"
        >
          Đánh giá của bạn
        </span>
      </div>

      <!-- Hiển thị đánh giá dựa vào tab đang chọn -->
      <div v-if="activeTab === 'all'" class="reviews-list">
        <div v-if="reviews.length > 0">
          <div
            v-for="review in reviews"
            :key="review._id + review.RATING"
            :id="`review-${review._id}`"
            class="review-item"
          >
            <div class="review-header">
              <span class="review-user">{{ review.USER_ID.FULLNAME }}</span>
              <span class="review-rating">
                <i
                  v-for="star in 5"
                  :key="`star-${review._id}-${star}`"
                  class="fa fa-star"
                  :class="{ 'active-star': star <= review.RATING }"
                ></i>
              </span>
            </div>
            <div class="review-date">{{ formatDate(review.createdAt) }}</div>
            <div class="review-comment">{{ review.COMMENT }}</div>
            <div v-if="review.USER_ID._id === userId" class="review-actions">
              <span @click="editReview(review)">
                <i class="fas fa-edit edit-icon" title="Chỉnh sửa"></i>
              </span>
              <span @click="deleteReview(review._id)">
                <i class="fas fa-trash-alt delete-icon" title="Xóa"></i>
              </span>
            </div>
          </div>
        </div>
        <div v-else class="no-reviews">Chưa có đánh giá cho phòng này.</div>
      </div>

      <div v-if="activeTab === 'yours'" class="reviews-list">
        <div v-if="userReviews.length > 0">
          <div
            v-for="review in userReviews"
            :key="review._id"
            :id="`review-${review._id}`"
            class="review-item"
          >
            <div class="review-header">
              <span class="review-user">{{ review.USER_ID.FULLNAME }}</span>
              <span class="review-rating">
                <i
                  v-for="star in 5"
                  :key="`star-${review._id}-${star}`"
                  class="fa fa-star"
                  :class="{ 'active-star': star <= review.RATING }"
                ></i>
              </span>
            </div>
            <div class="review-date">{{ formatDate(review.createdAt) }}</div>
            <div class="review-comment">{{ review.COMMENT }}</div>
            <div v-if="review.USER_ID._id === userId" class="review-actions">
              <span @click="editReview(review)">
                <i class="fas fa-edit edit-icon" title="Chỉnh sửa"></i>
              </span>
              <span @click="deleteReview(review._id)">
                <i class="fas fa-trash-alt delete-icon" title="Xóa"></i>
              </span>
            </div>
          </div>
        </div>
        <div v-else class="no-reviews">
          Bạn chưa có đánh giá nào cho phòng này.
        </div>
      </div>
    </div>

    <!-- Form cập nhật đánh giá -->
    <div v-if="showReviewModal" class="review-modal-overlay">
      <div class="review-modal">
        <div class="review-header">
          <h2>Cập Nhật Đánh Giá</h2>
          <span class="close-button" @click="closeReviewModal">&#10005;</span>
        </div>
        <div class="rating-section">
          <h3>Đánh giá của bạn</h3>
          <div class="star-rating">
            <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ selected: star <= reviewRating }"
              @click="selectRating(star)"
            >
              &#9733;
            </span>
          </div>
        </div>
        <textarea
          v-model="reviewComment"
          class="review-comment-model"
          placeholder="Viết nhận xét của bạn..."
        ></textarea>
        <button @click="submitUpdatedReview" class="submit-review-btn">
          Cập Nhật Đánh Giá
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import { mapState } from "vuex";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      room: null,
      mainImageIndex: 0,
      reviews: [],
      roomIdToScroll: null,
      bookingIdToScroll: null,
      showReviewModal: false,
      reviewId: null,
      reviewRating: 0,
      reviewComment: "",
      activeTab: "all",
    };
  },
  mounted() {
    this.fetchRoomDetail();
    this.fetchRoomReviews();

    this.roomIdToScroll = this.$route.query.roomId;
    this.bookingIdToScroll = this.$route.query.bookingId;
  },
  computed: {
    ...mapState(["userInfo"]),
    userId() {
      return this.userInfo ? this.userInfo._id : null;
    },
    userReviews() {
      return this.reviews.filter(
        (review) => review.USER_ID._id === this.userId
      );
    },
  },
  methods: {
    formatDate(dateString) {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("vi-VN", options);
    },
    async fetchRoomDetail() {
      const roomId = this.$route.params.id;
      try {
        const response = await axiosClient.get(`/rooms/getRoomById/${roomId}`);
        if (response.data && response.data.room) {
          this.room = response.data.room;
        } else {
          console.error("Không tìm thấy dữ liệu phòng.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết phòng:", error);
      }
    },
    scrollToReview(bookingId, roomId) {
      const review = this.reviews.find(
        (rev) =>
          String(rev.BOOKING_ID) === String(bookingId) &&
          String(rev.ROOM_ID) === String(roomId)
      );
      if (review) {
        const reviewElement = document.getElementById(`review-${review._id}`);
        if (reviewElement) {
          reviewElement.scrollIntoView({ behavior: "smooth", block: "center" });
          console.log("Scrolled to review:", review._id);
        } else {
          console.warn("Không tìm thấy phần tử DOM cho review.");
        }
      } else {
        console.warn("Không tìm thấy đánh giá khớp với bookingId và roomId.");
      }
    },
    async fetchRoomReviews() {
      const roomId = this.$route.params.id;
      try {
        const response = await axiosClient.get(
          `/reviews/getReviewsByRoomId/${roomId}`
        );
        if (response.data && response.data.reviews) {
          this.reviews = response.data.reviews;
          console.log("Dữ liệu đánh giá đã tải:", this.reviews);
          if (this.roomIdToScroll && this.bookingIdToScroll) {
            this.$nextTick(() => {
              this.scrollToReview(this.bookingIdToScroll, this.roomIdToScroll);
            });
          }
        } else {
          console.error("Không tìm thấy dữ liệu đánh giá.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy đánh giá phòng:", error);
      }
    },
    changeMainImage(index) {
      this.mainImageIndex = index;
    },
    editReview(review) {
      this.reviewId = review._id;
      this.reviewRating = review.RATING;
      this.reviewComment = review.COMMENT;
      this.showReviewModal = true;
    },
    closeReviewModal() {
      this.showReviewModal = false;
      this.reviewId = null;
      this.reviewRating = 0;
      this.reviewComment = "";
    },
    selectRating(star) {
      this.reviewRating = star;
    },
    async deleteReview(reviewId) {
      try {
        const result = await Swal.fire({
          title: "Xác nhận",
          text: "Bạn có chắc chắn muốn xóa đánh giá này không?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Có, xóa đánh giá!",
          cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
          const response = await axiosClient.delete(
            `/reviews/deleteReviewByUser/${reviewId}`
          );
          if (response.data.success) {
            Swal.fire("Thành công", "Đánh giá đã được xóa!", "success");
            this.fetchRoomReviews();
          } else {
            Swal.fire("Lỗi", response.data.msg || "Có lỗi xảy ra.", "error");
          }
        }
      } catch (error) {
        console.error("Lỗi khi xóa đánh giá:", error);
        Swal.fire("Lỗi", "Không thể kết nối đến server.", "error");
      }
    },
    async submitUpdatedReview() {
      try {
        const response = await axiosClient.put(
          `/reviews/updateReview/${this.reviewId}`,
          {
            rating: this.reviewRating,
            comment: this.reviewComment,
          }
        );

        console.log("Phản hồi từ API:", response.data);

        if (response.data.success) {
          Swal.fire(
            "Thành công",
            "Đánh giá của bạn đã được cập nhật!",
            "success"
          );
          this.closeReviewModal();

          const updatedReview = response.data.data;

          if (updatedReview && updatedReview._id) {
            const index = this.reviews.findIndex(
              (review) => review._id === updatedReview._id
            );

            if (index !== -1) {
              // Cập nhật trực tiếp đối tượng để Vue nhận diện sự thay đổi
              Object.assign(this.reviews[index], updatedReview);
            } else {
              console.error(
                "Không tìm thấy đánh giá trong danh sách hiện tại."
              );
            }
          } else {
            console.error(
              "Phản hồi từ API không chứa thông tin đánh giá cập nhật đầy đủ."
            );
          }
        } else {
          Swal.fire("Lỗi", response.data.message || "Có lỗi xảy ra.", "error");
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật đánh giá:", error);
        Swal.fire("Lỗi", "Không thể kết nối đến server.", "error");
      }
    },
  },
};
</script>

<style scoped>
.room-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #6d4c41;
  text-align: center;
  margin-bottom: 30px;
}

.image-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.main-image-container {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  margin-bottom: 10px;
}

.main-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: cover;
  border-radius: 8px;
}

.thumbnail-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  overflow-x: auto;
}

.thumbnail-image {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.thumbnail-image:hover,
.active-thumbnail {
  border-color: #6d4c41;
}

.room-info {
  margin-top: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 24px;
  color: #6d4c41;
  margin-bottom: 20px;
}

.info-item {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.info-item strong {
  color: #6d4c41;
}

.reviews-section {
  margin-top: 40px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.05);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 15px;
  border-bottom: 1px solid #ddd;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-user {
  font-weight: bold;
  color: #333;
}

.review-rating .fa-star {
  color: #ccc;
  font-size: 18px;
}

.review-rating .active-star {
  color: #ffcc00;
}

.review-comment {
  font-size: 16px;
  color: #666;
}

.no-reviews {
  text-align: center;
  font-size: 16px;
  color: #888;
}

.review-date {
  font-size: 14px;
  color: #888;
  margin-bottom: 5px;
}

.review-actions {
  margin-top: 10px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.review-actions i {
  font-size: 20px; /* Kích thước icon lớn hơn */
  cursor: pointer;
  transition: color 0.3s, transform 0.3s;
  padding: 5px;
  border-radius: 50%; /* Làm icon trông nổi bật */
}

.edit-icon {
  color: #6d4c41; /* Màu nâu sang trọng cho icon chỉnh sửa */
  background: rgba(109, 76, 65, 0.1); /* Màu nền nhẹ cho icon chỉnh sửa */
  padding: 5px;
  border-radius: 3px;
}

.edit-icon:hover {
  color: #5b3b33;
  transform: scale(1.1); /* Tăng kích thước khi hover */
}

.delete-icon {
  color: #d9534f; /* Màu đỏ cho icon xóa */
  background: rgba(217, 83, 79, 0.1); /* Màu nền nhẹ cho icon xóa */
  padding: 5px;
  border-radius: 3px;
}

.delete-icon:hover {
  color: #c9302c; /* Màu đỏ đậm hơn khi hover */
  transform: scale(1.1); /* Tăng kích thước khi hover */
}

.review-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6); /* Tăng độ mờ cho nền */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px); /* Thêm hiệu ứng blur cho nền */
}

.review-modal {
  background-color: #ffffff;
  width: 500px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: scaleIn 0.3s ease; /* Hiệu ứng khi mở modal */
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0; /* Đường gạch chân nhẹ */
  padding-bottom: 10px;
}

.review-header h2 {
  font-size: 24px;
  color: #6d4c41;
  font-weight: bold;
}

.close-button {
  cursor: pointer;
  font-size: 24px;
  color: #6d4c41;
  transition: color 0.3s;
}

.close-button:hover {
  color: #5b3b33;
}

.room-image {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.room-details p {
  margin: 5px 0;
  font-size: 16px;
  color: #6d4c41;
}

.rating-section {
  margin-top: 20px;
  text-align: center;
}

.rating-section h3 {
  font-size: 20px;
  color: #6d4c41;
  margin-bottom: 10px;
}

.star-rating {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.star {
  font-size: 30px;
  color: #e0e0e0;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  padding: 5px;
}

.star:hover {
  color: #ffcc00;
  transform: scale(1.2);
}

.star.selected {
  color: #ffcc00;
}

.review-comment-model {
  width: 100%;
  height: 120px;
  padding: 15px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  font-size: 16px;
  color: #333;
  background-color: #f9f9f9;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.review-comment-model::placeholder {
  color: #999;
}

.submit-review-btn {
  width: 100%;
  padding: 12px;
  background-color: #6d4c41;
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  margin-top: 20px;
}

.submit-review-btn:hover {
  background-color: #5b3b33;
  transform: translateY(-2px);
}

.submit-review-btn:active {
  transform: translateY(1px);
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  position: relative;
  border-bottom: 2px solid #ddd;
}

.tab-option {
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  color: #6d4c41;
  position: relative;
  transition: color 0.3s ease, transform 0.3s ease;
}

.tab-option:hover {
  color: #5b3b33;
  transform: translateY(-3px); /* Hiệu ứng nâng tab khi hover */
}

.tab-option.activeTab {
  color: #5b3b33;
  border-bottom: 3px solid transparent;
}

.tab-indicator {
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 3px;
  width: 100px;
  background-color: #5b3b33;
  transition: left 0.3s ease, width 0.3s ease;
}

/* CSS cho chỉ báo chuyển tab */
.tab-option.activeTab::before {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #5b3b33;
  transition: width 0.3s ease;
}

/* Thêm hiệu ứng chuyển đổi tab mượt mà */
.tab-option.activeTab::before {
  width: 100%;
}
</style>
