<template>
  <div class="main">
    <!-- Thanh tìm kiếm -->
    <div class="search-bar">
      <div class="search-fields">
        <!-- Địa điểm -->
        <div class="search-field date-range-field">
          <label for="destination">Bạn muốn nghỉ dưỡng ở đâu?</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-map-marker-alt"></i>
            </span>
            <input
              id="destination"
              type="text"
              class="form-control"
              placeholder="Nhập Khách sạn / Điểm đến"
              v-model="destination"
              @focus="filterHotelNames"
              @blur="hideSuggestionsWithDelay"
              @input="filterHotelNames"
            />
          </div>
          <ul
            v-if="showHotelSuggestions && filteredHotelNames.length"
            class="suggestions-list"
          >
            <li
              v-for="(hotel, index) in filteredHotelNames"
              :key="index"
              @mousedown.prevent="selectHotel(hotel.NAME)"
            >
              {{ hotel.NAME }}
            </li>
          </ul>
        </div>

        <!-- Ngày nhận - trả phòng -->
        <div class="search-field date-range-field">
          <label for="dateRange">Ngày nhận - trả phòng</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-calendar-alt"></i>
            </span>
            <DatePicker
              v-model="dateRange"
              type="daterange"
              placeholder="Ngày nhận - trả phòng"
              format="DD/MM/YYYY"
              :min-date="minDate"
              input-class="form-control"
              :clearable="false"
            />
          </div>
        </div>

        <!-- Số phòng -->
        <div class="search-field">
          <label for="rooms">Số phòng</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-bed"></i>
            </span>
            <input
              id="rooms"
              type="number"
              class="form-control"
              placeholder="1 Phòng"
              v-model="rooms"
              min="1"
            />
          </div>
        </div>

        <!-- Mã khuyến mãi -->
        <div class="search-field date-range-field">
          <label for="voucherCode">Mã khuyến mãi/Voucher</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-tag"></i>
            </span>
            <input
              id="voucherCode"
              type="text"
              class="form-control"
              placeholder="Nhập mã khuyến mại/mã Voucher"
              v-model="voucherCode"
            />
          </div>
        </div>

        <!-- Nút tìm kiếm -->
        <div class="search-field search-button">
          <button class="search-btn" @click="searchRooms">
            <i class="fas fa-search"></i> TÌM KIẾM
          </button>
        </div>
      </div>
    </div>

    <div class="hotel-info-card">
      <div class="hotel-image">
        <img :src="hotel.IMAGES[0]" alt="Hotel Image" />
        <a class="view-more-images" href="#">Xem thêm ảnh</a>
      </div>
      <div class="hotel-details">
        <h2 class="hotel-name">{{ hotel.NAME }}</h2>
        <p class="hotel-address">
          <i class="fa fa-map-marker" aria-hidden="true"></i>
          {{ hotel.ADDRESS.ADDRESS_LINE }}, {{ hotel.ADDRESS.WARD }},
          {{ hotel.ADDRESS.DISTRICT }}, {{ hotel.ADDRESS.CITY }},
          {{ hotel.ADDRESS.COUNTRY }}
        </p>
        <p class="hotel-phone">
          <i class="fa fa-phone" aria-hidden="true"></i>
          Điện thoại: {{ hotel.PHONE }}
        </p>
        <div class="description">
          <span v-if="isDescriptionTruncated">
            <span v-html="truncatedDescription"></span>...
            <a
              href="#"
              @click.prevent="viewHotelDetails(hotel._id)"
              class="view-more-details"
              >Xem chi tiết</a
            >
          </span>
          <span v-else v-html="hotel.DESCRIPTION"></span>
        </div>
      </div>
    </div>
    <div class="hotel-info-wrapper">
      <!-- Left: Room List -->
      <div class="left-room-list">
        <div class="room-list">
          <div
            v-for="(room, index) in availableRooms"
            :key="index"
            class="room-item"
          >
            <!-- Room Image -->
            <div class="room-image">
              <img
                v-if="room.IMAGES && room.IMAGES.length"
                :src="room.IMAGES[0]"
                alt="Room Image"
              />
            </div>

            <!-- Room Details -->
            <div class="room-details">
              <h4>
                {{ room.TYPE }} {{ room.CUSTOM_ATTRIBUTES?.bedType || "" }}
              </h4>
              <p>
                <i class="fas fa-bed"></i>
                {{ room.CUSTOM_ATTRIBUTES?.bedType || "N/A" }} &nbsp;
                <i class="fas fa-ruler-combined"></i>
                {{ room.CUSTOM_ATTRIBUTES?.area || "N/A" }} m²
              </p>
              <a
                href="#"
                @click.prevent="viewRoomAmenities(room)"
                class="view-amenities"
              >
                Xem tất cả tiện nghi
              </a>
              <div class="price-choose-room">
                <p>
                  Giá:
                  <strong>
                    {{ room.PRICE_PERNIGHT?.toLocaleString() || "N/A" }}
                    VND</strong
                  >
                  / đêm
                </p>
                <button class="select-room-btn" @click="selectRoom(room)">
                  Chọn phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Booking Information -->
      <div class="right-booking-info">
        <div class="booking-info">
          <h3>Thông tin đặt phòng</h3>

          <!-- Tên khách sạn -->
          <p class="hotel-name-booking">{{ hotel.NAME }}</p>

          <!-- Ngày nhận và trả phòng -->
          <p class="time">
            {{ formattedStartDate }} - {{ formattedEndDate }} ({{
              nightsCount + 1
            }}
            ngày {{ nightsCount > 1 ? nightsCount + " đêm" : "1 đêm" }})
          </p>

          <!-- Thông tin phòng (khi người dùng đã chọn phòng) -->
          <div v-if="selectedRoom">
            <h4>Thông tin phòng</h4>
            <p>
              <b>Phòng:</b> {{ selectedRoom.TYPE }}
              {{ selectedRoom.CUSTOM_ATTRIBUTES?.bedType || "" }}
            </p>
            <div class="price-cancle">
              <p class="price">
                {{ selectedRoom.PRICE_PERNIGHT?.toLocaleString() }} VNĐ /đêm
              </p>
              <button class="cancle" @click="removeRoom">X Hủy</button>
            </div>
          </div>

          <div class="total-info-book">
            <div>Tổng cộng:</div>
            <div class="total-book">
              {{ calculateTotalPrice().toLocaleString() }} VNĐ
            </div>
          </div>
          <!-- Nút đặt ngay -->
          <button class="confirm-booking-btn" @click="confirmBooking">
            Đặt ngay
          </button>
          <!-- Tổng giá -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";

export default {
  props: ["hotelId", "roomType", "roomNumbers"],
  components: {
    DatePicker,
  },
  data() {
    return {
      hotelId: null,
      hotel: {
        ADDRESS: {},
        IMAGES: [],
      },
      availableRooms: [],
      selectedRoom: null, // Phòng đã chọn
      startDate: null, // Ngày nhận phòng
      endDate: null, // Ngày trả phòng
    };
  },
  mounted() {
    this.hotelId = this.$route.query.hotelId;
    this.startDate = this.$route.query.startDate;
    this.endDate = this.$route.query.endDate;
    this.fetchHotelDetails();
    this.fetchAvailableRooms();
  },
  computed: {
    isDescriptionTruncated() {
      const maxLength = 352;
      return (
        this.hotel.DESCRIPTION && this.hotel.DESCRIPTION.length > maxLength
      );
    },
    truncatedDescription() {
      const maxLength = 352;
      return this.hotel.DESCRIPTION
        ? this.hotel.DESCRIPTION.substring(0, maxLength)
        : "";
    },
    nightsCount() {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      // Tính tổng số ngày giữa ngày bắt đầu và kết thúc
      const diffTime = end.getTime() - start.getTime();
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Số đêm chính là số ngày - 1 (ngày trả phòng không tính là một đêm)
      return days;
    },
    formattedStartDate() {
      return new Date(this.startDate).toLocaleDateString();
    },
    formattedEndDate() {
      return new Date(this.endDate).toLocaleDateString();
    },
  },
  methods: {
    viewRoomAmenities(room) {
      // Logic hiển thị tiện nghi phòng, hoặc bạn có thể chỉ cần console log ra để kiểm tra
      console.log("Hiển thị tiện nghi của phòng:", room);
    },
    viewHotelDetails(hotelId) {
      // Điều hướng đến trang chi tiết khách sạn với ID
      this.$router.push(`/trangchu/khach-san/${hotelId}`);
    },

    async fetchHotelDetails() {
      try {
        console.log("Hotel ID:", this.hotelId);
        const response = await axiosClient.get(
          `/hotels/getHotelById/${this.hotelId}`
        );
        this.hotel = response.data.data;
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách sạn:", error);
      }
    },
    async fetchAvailableRooms() {
      try {
        // Kiểm tra nếu các giá trị đã được lấy thành công từ route
        if (this.hotelId && this.startDate && this.endDate) {
          const response = await axiosClient.post("/rooms/AvailableRooms", {
            hotelId: this.hotelId,
            startDate: this.startDate,
            endDate: this.endDate,
          });

          // Kiểm tra nếu response thành công và có dữ liệu
          if (response.data.success) {
            this.availableRooms = response.data.data;
          } else {
            this.$toast.error("Không thể lấy danh sách phòng.");
          }
        } else {
          console.error("Hotel ID hoặc ngày không được cung cấp");
          this.$toast.error(
            "Vui lòng cung cấp đầy đủ thông tin khách sạn và ngày."
          );
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy danh sách phòng:", error);
        this.$toast.error("Lỗi xảy ra khi lấy danh sách phòng.");
      }
    },
    // Chọn phòng
    selectRoom(room) {
      this.selectedRoom = room;
    },
    removeRoom() {
      this.selectedRoom = null;
    },
    calculateTotalPrice() {
      if (this.selectedRoom) {
        return this.selectedRoom.PRICE_PERNIGHT * this.nightsCount;
      }
      return 0;
    },
  },
};
</script>

<style scoped>
.main {
  padding: 20px 0 50px;
  /* background: #E5E5E5; */
  margin: 20px 160px;
}
.hotel-info-card {
  display: flex;
  /* border: 1px solid #e0e0e0; */
  /* border-radius: 10px; */
  background-color: #fff;
  overflow: hidden;
  margin-bottom: 20px;
  /* width: 500px; */
  /* height: 250px; */
  /* margin: 20px 60px; */
}

.hotel-image {
  position: relative;
  flex: 0 0 20%;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding: 15px;
}

.view-more-images {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 14px;
}

.hotel-details {
  flex: 1;
  padding: 15px 10px;
}

.hotel-name {
  font-size: 24px;
  margin-bottom: 10px;
}

.hotel-address,
.hotel-phone {
  margin: 5px 0;
  font-size: 16px;
  color: #666;
}

.hotel-description {
  overflow: hidden;
  text-overflow: ellipsis; /* Ẩn phần còn lại của text */
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Hiển thị 2 dòng đầu tiên */
  -webkit-box-orient: vertical;
  line-height: 1.4;
  max-height: 2.8em; /* Đảm bảo chiều cao phù hợp với số dòng hiển thị */
}

.view-more-details {
  color: #e53935;
  cursor: pointer;
  text-decoration: none;
  margin-left: 5px;
}

.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 20px 20px; /* Điều chỉnh padding */
  /* border-radius: 8px; */
  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); */
  /* width: 95%;  */
  /* max-width: 1350px;  */
  /* margin: 20px auto 20px auto; */
  position: relative;
  margin-bottom: 20px;
}

.search-fields {
  display: flex;
  gap: 30px;
  flex-wrap: nowrap; /* Đảm bảo các trường nằm trên một hàng ngang */
  align-items: center;
  width: 100%;
}

.search-field {
  flex: 1; /* Giúp các trường cân đối */
  min-width: 150px; /* Đảm bảo kích thước tối thiểu */
  display: flex;
  flex-direction: column;
  gap: 5px; /* Khoảng cách giữa label và input */
}

.date-range-field {
  flex: 1.4; /* Chiếm nhiều không gian hơn cho trường ngày nhận - trả phòng */
}

.search-field label {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.input-group {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  flex-wrap: nowrap;
}

.input-group-text {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 5px 0 0 5px;
  padding: 10px;
  font-size: 16px;
  height: 40px; /* Chiều cao đồng đều */
  display: flex;
  align-items: center; /* Căn giữa icon theo chiều dọc */
}

.input-group .form-control {
  border-radius: 0 5px 5px 0;
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 16px;
  height: 40px; /* Đảm bảo chiều cao đồng đều */
  width: 100%;
}

.search-btn {
  background-color: #a06e5c;
  color: #fff;
  padding: 10px 20px; /* Thu nhỏ nút tìm kiếm */
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px; /* Chiều cao tương tự các input */
  justify-content: center;
  min-width: 120px; /* Đảm bảo kích thước tối thiểu cho nút */
  margin-top: 29px;
}

.search-btn i {
  font-size: 18px;
}

.search-btn:hover {
  background-color: #3f0e00;
}

.suggestions-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  position: absolute;
  background: #fff;
  width: 100px; /* Đảm bảo chiều rộng phù hợp với input */
  z-index: 1000; /* Tăng z-index để đảm bảo nằm trên cùng */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Thêm đổ bóng để nổi bật */
  top: 92px; /* Hiển thị ngay bên dưới ô input */
}

.suggestions-list li {
  padding: 10px;
  cursor: pointer;
}

.suggestions-list li:hover {
  background-color: #f1f1f1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .search-fields {
    flex-direction: column;
    gap: 15px;
  }

  .search-btn {
    width: 100%; /* Chiều rộng 100% khi màn hình nhỏ */
    justify-content: center;
  }

  .search-bar {
    padding: 10px 15px; /* Giảm padding cho màn hình nhỏ */
  }
}

.hotel-info-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.left-room-list {
  width: 70%;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
}

.room-item {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.room-image {
  width: 30%;
  margin-right: 20px;
}

.room-image img {
  width: 100%;
  border-radius: 10px;
}

.room-details {
  width: 70%;
}

.select-room-btn {
  background-color: #a06e5c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
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

.confirm-booking-btn {
  width: 100%;
  background-color: #a06e5c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.confirm-booking-btn:disabled {
  background-color: #ccc;
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

.booking-info .hotel-name-booking {
  font-weight: 700;
  font-size: 18px;
  font-weight: bold;
  line-height: normal;
  margin-bottom: 15px;
}

.booking-info .time {
  border-bottom: 1px dashed #dddddd;
  padding-bottom: 15px;
}

.booking-info .cancle {
  border: 1px solid;
  padding: 10px 5px;
  min-width: 70px;
}

.booking-info .cancle:hover {
  background-color: #3f0e00;
  color: #f8f9fa;
}

.booking-info .price-cancle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: normal;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dddddd;
}

.booking-info .price {
  margin-top: 10px;
  font-weight: bold;
}

.right-booking-info .total-info-book {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 16px;
  line-height: normal;
  margin-bottom: 10px;
}
.total-book {
  font-size: 20px;
  color: #6a2410;
}

.room-details strong {
  font-size: 20px;
  color: #6a2410;
}

.price-choose-room {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
