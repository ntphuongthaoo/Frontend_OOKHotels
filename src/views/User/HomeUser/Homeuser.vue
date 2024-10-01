<template>
  <div>
    <!-- Carousel với hình ảnh khách sạn -->
    <div class="product-page">
      <!-- Banner Section -->
      <div class="carousel">
        <div class="carousel-inner">
          <div
            v-for="(banner, index) in banners"
            :key="index"
            class="carousel-item"
            :class="{ active: index === currentIndex }"
          >
            <img :src="banner" alt="Banner" />
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="products">
        <div v-for="product in products" :key="product.id" class="product-card">
          <img :src="product.image" :alt="product.name" />
          <h3>{{ product.name }}</h3>
          <p>{{ product.price }}</p>
        </div>
      </div>
    </div>

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

    <!-- Khách sạn nổi bật -->
    <div class="container featured-hotels">
      <h2 class="text-center">KHÁCH SẠN CỦA CHÚNG TÔI</h2>
      <div id="featuredCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div
            class="carousel-item"
            :class="{ active: index === 0 }"
            v-for="(chunk, index) in chunkedHotels"
            :key="index"
          >
            <div class="row gx-0">
              <!-- Hai tấm bên trái -->
              <div
                class="col-md-4 d-flex flex-column group-card"
                style="height: 600px"
              >
                <div
                  class="small-card flex-fill"
                  v-for="hotel in chunk.left"
                  :key="hotel._id"
                  @click="goToHotel(hotel._id)"
                >
                  <img :src="hotel.IMAGES" class="card-img" :alt="hotel.NAME" />
                  <h5 class="card-title">{{ hotel.NAME }}</h5>
                </div>
              </div>

              <!-- Tấm lớn ở giữa -->
              <div class="col-md-4 big-card group-card">
                <div class="big-card" @click="goToHotel(chunk.middle._id)">
                  <img
                    :src="chunk.middle.IMAGES"
                    class="card-img big-img h-100"
                    :alt="chunk.middle.NAME"
                  />
                  <h5 class="card-title">{{ chunk.middle.NAME }}</h5>
                </div>
              </div>

              <!-- Hai tấm bên phải -->
              <div
                class="col-md-4 d-flex flex-column group-card"
                style="height: 600px"
              >
                <div
                  class="small-card flex-fill"
                  v-for="hotel in chunk.right"
                  :key="hotel._id"
                  @click="goToHotel(hotel._id)"
                >
                  <img :src="hotel.IMAGES" class="card-img" :alt="hotel.NAME" />
                  <h5 class="card-title">{{ hotel.NAME }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Điều khiển carousel -->
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#featuredCarousel"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#featuredCarousel"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../../api/axiosClient";
import { deburr } from "lodash";
import bannerProduct from "@/assets/bg_1.jpg";
import bannerProduct1 from "@/assets/bg_2.jpg";
import bannerProduct2 from "@/assets/bg_3.jpg";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";

export default {
  name: "BannerComponent",
  components: {
    DatePicker,
  },
  data() {
    const today = new Date(); // Lấy ngày hiện tại
    const checkIn = new Date(today); // Ngày nhận phòng là hôm nay
    const checkOut = new Date(today); // Ngày trả phòng là 3 ngày sau
    checkOut.setDate(checkOut.getDate() + 2); // Thiết lập khoảng ngày là 3 ngày
    return {
      banners: [bannerProduct, bannerProduct1, bannerProduct2],
      currentIndex: 0,
      featuredHotels: [],
      destination: "",
      checkInDate: checkIn,
      checkOutDate: checkOut,
      rooms: 1,
      voucherCode: "",
      minDate: today,
      dateRange: [checkIn, checkOut],
      hotelNames: [], // Danh sách khách sạn
      filteredHotelNames: [], // Danh sách khách sạn đã lọc
      showHotelSuggestions: false, // Trạng thái hiển thị gợi ý
    };
  },
  mounted() {
    this.fetchFeaturedHotels();
    this.fetchHotelNames();
    this.startCarousel();
  },
  methods: {
    startCarousel() {
      const items = document.querySelectorAll(".carousel-item");
      this.currentIndex = 0; // Set the initial index to show the first item

      setInterval(() => {
        items[this.currentIndex].classList.remove("active");
        this.currentIndex = (this.currentIndex + 1) % items.length;
        items[this.currentIndex].classList.add("active");
      }, 5000); // Change every 5 seconds
    },

    async fetchFeaturedHotels() {
      try {
        const response = await axiosClient.get("/hotels/getAllHotels");
        console.log("Dữ liệu khách sạn:", response.data);
        this.featuredHotels = response.data.data;
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách sạn:", error);
      }
    },
    async fetchHotelNames() {
      try {
        const response = await axiosClient.get("/hotels/getHotelsName");
        this.hotelNames = response.data.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tên khách sạn:", error);
      }
    },
    filterHotelNames() {
      const normalizedInput = deburr(this.destination.toLowerCase()); // Loại bỏ dấu và chuyển thành chữ thường
      if (normalizedInput === "") {
        // Nếu input trống, hiển thị toàn bộ danh sách khách sạn
        this.filteredHotelNames = this.hotelNames;
      } else {
        this.filteredHotelNames = this.hotelNames.filter((hotel) => {
          const normalizedHotelName = deburr(hotel.NAME.toLowerCase()); // Loại bỏ dấu và chuyển thành chữ thường
          return normalizedHotelName.includes(normalizedInput); // So sánh chuỗi đã chuyển đổi
        });
      }
      this.showHotelSuggestions = true; // Hiển thị gợi ý
    },
    selectHotel(name) {
      this.destination = name;
      this.showHotelSuggestions = false;
    },
    hideSuggestionsWithDelay() {
      setTimeout(() => {
        this.showHotelSuggestions = false;
      }, 200); // Đợi một khoảng thời gian ngắn để cho phép click vào gợi ý
    },
    goToHotel(hotelId) {
      this.$router.push({ name: "HotelDetail", params: { id: hotelId } });
    },
    searchRooms() {
      console.log({
        destination: this.destination,
        checkInDate: this.dateRange[0],
        checkOutDate: this.dateRange[1],
        rooms: this.rooms,
        voucherCode: this.voucherCode,
      });
    },
  },
  computed: {
    chunkedHotels() {
      if (!Array.isArray(this.featuredHotels)) {
        return []; // Trả về mảng rỗng nếu không phải là mảng
      }

      const chunks = [];
      for (let i = 0; i < this.featuredHotels.length; i += 5) {
        chunks.push({
          left: this.featuredHotels.slice(i, i + 2),
          middle: this.featuredHotels[i + 2] || {},
          right: this.featuredHotels.slice(i + 3, i + 5),
        });
      }
      return chunks;
    },
  },
};
</script>

<style scoped>
@import "./HomeUser.scss";
</style>
