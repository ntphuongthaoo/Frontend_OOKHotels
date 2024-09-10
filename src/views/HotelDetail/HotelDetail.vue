<template>
  <div>
    <div
      id="carouselExampleIndicators"
      class="carousel slide"
      data-bs-ride="carousel"
    >
      <div class="carousel-indicators">
        <button
          v-for="(image, index) in hotel.IMAGE"
          :key="index"
          :data-bs-target="'#carouselExampleIndicators'"
          :data-bs-slide-to="index"
          :class="{ active: index === 0 }"
        ></button>
      </div>
      <div class="carousel-inner">
        <div
          v-for="(image, index) in hotel.IMAGE"
          :key="index"
          :class="['carousel-item', { active: index === 0 }]"
        >
          <!-- Hiển thị chỉ hình ảnh -->
          <img :src="image" class="d-block w-100" />
        </div>
      </div>
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>

    <!-- Thanh tìm kiếm -->
    <div class="search-bar">
      <div class="search-fields">
        <div class="search-field">
          <label for="destination">Địa điểm bạn muốn đến là gì?</label>
          <input
            id="destination"
            type="text"
            placeholder="Nhập Khách sạn / Điểm đến"
            v-model="destination"
          />
        </div>
        <div class="search-field">
          <label for="checkInDate">Ngày nhận phòng</label>
          <input id="checkInDate" type="date" v-model="checkInDate" />
        </div>
        <div class="search-field">
          <label for="checkOutDate">Ngày trả phòng</label>
          <input id="checkOutDate" type="date" v-model="checkOutDate" />
        </div>
        <div class="search-field">
          <label for="rooms">Số phòng</label>
          <input
            id="rooms"
            type="number"
            placeholder="Phòng"
            v-model="rooms"
            min="1"
          />
        </div>
        <div class="search-field">
          <label for="voucherCode">Mã khuyến mãi</label>
          <input
            id="voucherCode"
            type="text"
            placeholder="Nhập mã khuyến mại/mã Voucher"
            v-model="voucherCode"
          />
        </div>
        <button class="search-btn" @click="searchRooms">Tìm kiếm</button>
      </div>
    </div>

    <!-- Thông tin khách sạn -->
    <div class="container hotel-details">
      <h1>{{ hotel.NAME }}</h1>
      <p class="address">
        <i class="fa fa-location-arrow" aria-hidden="true"></i>
        {{ hotel.ADDRESS.ADDRESS_LINE }}, {{ hotel.ADDRESS.WARD }},
        {{ hotel.ADDRESS.DISTRICT }}, {{ hotel.ADDRESS.CITY }},
        {{ hotel.ADDRESS.COUNTRY }}
      </p>
      <p><i class="fa fa-phone" aria-hidden="true"></i>
        <strong class="name">Phone:</strong> {{ hotel.PHONE }}</p>
      <p>
        <strong>Email: </strong>
        <a :href="'mailto:' + hotel.EMAIL">{{ hotel.EMAIL }}</a>
      </p>
      <div class="description" v-html="hotel.DESCRIPTION"></div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";

export default {
  props: ['id'],
  name: "HotelDetail",
  data() {
    return {
      hotel: {
        ADDRESS: {},
        IMAGE: []
      },
    };
  },
  mounted() {
    console.log(this.id);
    this.fetchHotelDetails();
  },
  methods: {
    async fetchHotelDetails() {
      try {
        const hotelId = this.$route.params.id; // Lấy ID từ route params
        const response = await axiosClient.get(`/hotels/getHotelById/${hotelId}`);
        console.log("Dữ liệu khách sạn:", response.data);
        this.hotel = response.data.data; // Cập nhật dữ liệu khách sạn
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách sạn:", error);
      }
    },
  },
};
</script>

<style scoped>

.carousel-inner {
  max-height: 700px;
}

.carousel-item {
  height: 80vh;
  background-size: cover;
  background-position: center;
  position: relative; /* Đảm bảo các phần tử con có thể căn chỉnh chính xác */
  /* display: flex;  */
  align-items: center; /* Căn giữa theo chiều dọc */
  /* justify-content: center; */
}

.carousel-item img {
  width: 100%;
  height: 100%; /* Đảm bảo hình ảnh lấp đầy phần chứa */
  object-fit: cover; /* Đảm bảo hình ảnh không bị biến dạng */
}

.carousel-caption {
  position: absolute; /* Đảm bảo caption nằm trên ảnh */
  top: 50%; /* Đặt cách từ đỉnh carousel item */
  left: 50%;
  transform: translate(-50%, -50%); /* Căn giữa cả chiều ngang và dọc */
  background-color: rgba(0, 0, 0, 0.5); /* Nền bán trong suốt */
  padding: 10px;
  border-radius: 5px;
  color: white;
  text-align: center; /* Căn giữa nội dung text */
  width: 80%; /* Đặt chiều rộng để caption chiếm 80% chiều rộng của carousel-item */
  height: 150px;
  box-sizing: border-box; /* Đảm bảo padding không ảnh hưởng đến chiều rộng */
}

.search-bar {
    display: flex;
  flex-wrap: wrap;
  gap: 10px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.search-fields {
  display: flex;
  flex-wrap: wrap; /* Cho phép các trường nhập liệu xuống dòng nếu không đủ không gian */
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.search-field {
  flex: 1;
  min-width: 200px; /* Đảm bảo các trường không quá nhỏ */
}

.search-field label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.search-fields input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box; /* Đảm bảo padding không ảnh hưởng đến chiều rộng */
}

.search-fields input[type="text"] {
  width: 200px;
}

.search-fields input[type="date"] {
  width: 150px; /* Chiều rộng cho trường chọn ngày */
}

.search-fields input[type="number"] {
  width: 100px; /* Chiều rộng cho trường nhập số phòng */
}

.search-btn {
  background-color: #fda000;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  flex: 1;
  min-width: 200px; 
}

.search-btn:hover {
  background-color: #e89500;
}

@media (max-width: 768px) {
    .search-field, .search-btn {
      flex: 1 1 100%;
    }
  }


.hotel-details {
  padding: 20px;
  margin-top: 60px; /* Đảm bảo phần thông tin khách sạn không bị đè lên bởi search bar */
}

.hotel-details .address {
  font-style: italic;
}

.hotel-details .description {
  margin-top: 20px;
}

</style>
