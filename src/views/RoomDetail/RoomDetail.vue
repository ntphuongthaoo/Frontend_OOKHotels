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
      <div v-if="reviews.length > 0" class="reviews-list">
        <div v-for="review in reviews" :key="review._id" class="review-item">
          <div class="review-header">
            <span class="review-user">{{ review.USER_ID.FULLNAME }}</span>
            <span class="review-rating">
              <i
                v-for="star in 5"
                :key="star"
                class="fa fa-star"
                :class="{ 'active-star': star <= review.RATING }"
              ></i>
            </span>
          </div>
          <div class="review-date">{{ formatDate(review.createdAt) }}</div>
          <div class="review-comment">{{ review.COMMENT }}</div>
        </div>
      </div>
      <div v-else class="no-reviews">Chưa có đánh giá cho phòng này.</div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";

export default {
  data() {
    return {
      room: null, // Dữ liệu phòng
      mainImageIndex: 0, // Ảnh chính
      reviews: [], // Danh sách đánh giá
    };
  },
  mounted() {
    this.fetchRoomDetail(); // Lấy chi tiết phòng
    this.fetchRoomReviews(); // Lấy danh sách đánh giá
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
    // Hàm lấy chi tiết phòng
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
    // Hàm lấy danh sách đánh giá
    async fetchRoomReviews() {
      const roomId = this.$route.params.id;
      try {
        const response = await axiosClient.get(
          `/reviews/getReviewsByRoomId/${roomId}`
        );
        if (response.data && response.data.reviews) {
          this.reviews = response.data.reviews;
        } else {
          console.error("Không tìm thấy dữ liệu đánh giá.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy đánh giá phòng:", error);
      }
    },
    // Thay đổi ảnh chính
    changeMainImage(index) {
      this.mainImageIndex = index;
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

</style>
