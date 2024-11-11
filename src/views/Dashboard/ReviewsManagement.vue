<template>
  <div class="review-management">
    <h1>Quản lý Đánh giá</h1>

    <!-- Bộ lọc Khách sạn, Loại phòng, và Số sao -->
    <div class="filters">
      <label>
        Khách sạn:
        <select v-model="selectedHotel" @change="onHotelChange">
          <option value="">Chọn khách sạn</option>
          <option
            v-for="hotel in filteredHotels"
            :key="hotel._id"
            :value="hotel._id"
          >
            {{ hotel.NAME }}
          </option>
        </select>
      </label>

      <label>
        Loại phòng:
        <select v-model="selectedRoomType" @change="fetchReviewsByHotel">
          <option value="">Tất cả loại phòng</option>
          <option v-for="type in roomTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </label>

      <label>
        Số sao:
        <select v-model="selectedRating" @change="fetchReviewsByHotel">
          <option value="">Tất cả</option>
          <option value="1">1 Sao</option>
          <option value="2">2 Sao</option>
          <option value="3">3 Sao</option>
          <option value="4">4 Sao</option>
          <option value="5">5 Sao</option>
        </select>
      </label>
    </div>

    <!-- Bảng đánh giá -->
    <table class="review-table">
      <thead>
        <tr>
          <th>Người dùng</th>
          <th>Phòng</th>
          <th>Loại Phòng</th>
          <th>Loại Giường</th>
          <th>Rating</th>
          <th>Bình luận</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="reviews.length === 0">
          <td colspan="7" class="no-results">{{ noResultsMessage }}</td>
        </tr>
        <tr v-for="review in reviews" :key="review._id">
          <td>{{ review.USER_ID.FULLNAME }}</td>
          <td>{{ review.ROOM_ID.ROOM_NUMBER }}</td>
          <td>{{ review.ROOM_ID.TYPE }}</td>
          <td>{{ review.ROOM_ID.CUSTOM_ATTRIBUTES.bedType }}</td>
          <td>
            <span v-for="n in review.RATING" :key="n" class="star"
              >&#9733;</span
            >
          </td>
          <td>{{ review.COMMENT }}</td>
          <td>
            <button
              @click="confirmToggleStatus(review._id, !review.STATUS)"
              :class="review.STATUS ? 'hide-button' : 'show-button'"
            >
              <i :class="review.STATUS ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              {{ review.STATUS ? "Ẩn" : "Hiển thị" }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import Swal from "sweetalert2";
import { mapGetters } from "vuex";

export default {
  name: "ReviewManagement",
  data() {
    return {
      hotels: [], // Danh sách khách sạn
      rooms: [], // Danh sách phòng trong khách sạn đã chọn
      reviews: [], // Danh sách đánh giá
      selectedHotel: "", // ID khách sạn được chọn
      selectedRoomType: "", // Loại phòng đã chọn
      selectedRating: "", // Số sao đánh giá đã chọn
      noResultsMessage: "Không tìm thấy đánh giá nào phù hợp với tiêu chí lọc.",
      roomTypes: ["Superior", "Deluxe", "Suite"],
    };
  },
  computed: {
    ...mapGetters(["isAdmin", "getHotelId"]), // Lấy vai trò người dùng từ Vuex
    filteredHotels() {
      // Nếu là admin, hiển thị tất cả khách sạn
      if (this.isAdmin) {
        return this.hotels;
      }
      // Nếu là staff, chỉ hiển thị khách sạn mà họ thuộc về
      return this.hotels.filter((hotel) => hotel._id === this.getHotelId);
    },
  },
  methods: {
    // Lấy danh sách khách sạn
    async fetchHotels() {
      try {
        const response = await axiosClient.get("/hotels/getAllHotels");
        this.hotels = response.data.data;

        // Gán giá trị khách sạn cho nhân viên nếu không phải admin
        if (!this.isAdmin && this.getHotelId) {
          this.selectedHotel = this.getHotelId; // Gán giá trị khách sạn cho nhân viên
          this.fetchReviewsByHotel(); // Gọi để lấy đánh giá ngay lập tức
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách sạn:", error);
        alert("Không thể tải danh sách khách sạn.");
      }
    },

    async fetchRooms() {
      if (!this.selectedHotel) {
        this.rooms = [];
        return;
      }
      try {
        const response = await axiosClient.get(
          `/rooms/getRooms/${this.selectedHotel}`
        );
        this.rooms = response.data.data;
      } catch (error) {
        console.error("Lỗi khi tải danh sách phòng:", error);
        alert("Không thể tải danh sách phòng.");
      }
    },

    // Gọi khi khách sạn được chọn
    async onHotelChange() {
      this.fetchRooms(); // Lấy danh sách phòng
      this.fetchReviewsByHotel(); // Lấy đánh giá dựa trên khách sạn đã chọn
    },

    // Lấy danh sách đánh giá theo khách sạn đã chọn
    async fetchReviewsByHotel() {
      if (!this.selectedHotel) {
        this.reviews = [];
        return;
      }

      try {
        const params = {
          hotelId: this.selectedHotel,
          roomId: this.selectedRoomType || undefined,
          rating: this.selectedRating || undefined,
        };
        const response = await axiosClient.get("/reviews/getReviews", {
          params,
        });
        this.reviews = response.data.reviews;

        // Kiểm tra nếu không có đánh giá nào
        if (this.reviews.length === 0) {
          Swal.fire({
            title: "Không có kết quả!",
            text: this.noResultsMessage,
            icon: "info",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        alert("Không thể tải danh sách đánh giá.");
      }
    },

    // Hiển thị xác nhận trước khi ẩn hoặc hiển thị đánh giá
    async confirmToggleStatus(reviewId, status) {
      const action = status ? "hiển thị" : "ẩn";
      const result = await Swal.fire({
        title: `Bạn có chắc chắn muốn ${action} đánh giá này?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Có",
        cancelButtonText: "Không",
      });

      if (result.isConfirmed) {
        await this.toggleStatus(reviewId, status);
        Swal.fire({
          title: `Đánh giá đã được ${action}`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    },

    // Ẩn/hiển thị đánh giá
    async toggleStatus(reviewId, status) {
      try {
        await axiosClient.patch(`/reviews/toggleReviewStatus/${reviewId}`, {
          status,
        });
        this.fetchReviewsByHotel(); // Làm mới danh sách sau khi thay đổi trạng thái
      } catch (error) {
        console.error("Lỗi khi thay đổi trạng thái đánh giá:", error);
        alert("Không thể thay đổi trạng thái đánh giá.");
      }
    },
  },
  mounted() {
    this.fetchHotels(); // Lấy danh sách khách sạn khi component được tải
  },
};
</script>

<style scoped>
.review-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}

select {
  padding: 10px;
  margin-top: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.review-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.review-table th,
.review-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
  font-size: 16px;
}

.review-table th {
  background-color: #f7f7f7;
  font-weight: bold;
}

.star {
  color: #fbc02d;
}

.hide-button {
  background-color: #f39c12;
  color: #fff;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.show-button {
  background-color: #27ae60;
  color: #fff;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.no-results {
  text-align: center;
  color: #888;
  font-style: italic;
}
</style>
