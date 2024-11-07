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
          <label for="destination">Bạn muốn đến đâu?</label>
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

        <div class="search-field date-range-field">
          <label for="checkInDate">Ngày nhận phòng</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-calendar-alt"></i>
            </span>
            <input
              id="checkInDate"
              type="date"
              class="form-control"
              v-model="checkInDate"
              :min="minDate"
              @change="updateCheckOutMinDate"
              placeholder="Chọn ngày nhận phòng"
            />
          </div>
        </div>

        <!-- Ngày trả phòng -->
        <div class="search-field date-range-field">
          <label for="checkOutDate">Ngày trả phòng</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-calendar-alt"></i>
            </span>
            <input
              id="checkOutDate"
              type="date"
              class="form-control"
              v-model="checkOutDate"
              :min="minCheckOutDate"
              placeholder="Chọn ngày trả phòng"
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

    <!-- Lợi ích -->
    <div class="benefits-section">
      <div class="benefit-item">
        <i class="fas fa-tags benefit-icon"></i>
        <p class="benefit-text">Đảm bảo giá tốt nhất</p>
      </div>
      <div class="benefit-item">
        <i class="fas fa-map benefit-icon"></i>
        <p class="benefit-text">Đa dạng điểm đến lựa chọn tốt nhất</p>
      </div>
      <div class="benefit-item">
        <i class="fas fa-star benefit-icon"></i>
        <p class="benefit-text">Đảm bảo chất lượng phục vụ tốt nhất</p>
      </div>
      <div class="benefit-item">
        <i class="fas fa-headset benefit-icon"></i>
        <p class="benefit-text">Hỗ trợ khách hàng nhanh nhất</p>
      </div>
    </div>

    <div class="highlighted-hotels">
      <h2 class="section-title">KHÁCH SẠN NỔI BẬT</h2>
      <div class="hotel-grid">
        <div
          v-for="hotel in topBookedHotels"
          :key="hotel._id"
          class="hotel-card"
          @click="goToHotel(hotel._id)"
        >
          <div
            class="hotel-background"
            :style="{ backgroundImage: `url(${hotel.IMAGES[0]})` }"
          ></div>
          <div class="hotel-info-card">
            <img
              :src="hotel.IMAGES[0]"
              alt="Hotel Image"
              class="hotel-thumbnail"
            />
            <div class="info">
              <h3 class="hotel-name">{{ hotel.NAME }}</h3>
              <div class="rating">
                <span
                  v-for="index in 5"
                  :key="index"
                  class="star"
                  :style="getStarStyle(index, hotel.RATING)"
                  >⭐</span
                >
                <!-- <span class="rating-value">{{ hotel.RATING.toFixed(1) }}</span> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hotel-carousel-container">
      <h2 class="section-title">KHÁCH SẠN CỦA CHÚNG TÔI</h2>
      <div id="hotelCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div
            v-for="(chunk, index) in chunkedHotels"
            :key="index"
            class="carousel-item"
            :class="{ active: index === 0 }"
          >
            <div class="hotel-grid">
              <div
                v-for="hotel in chunk"
                :key="hotel._id"
                class="hotel-card"
                @click="goToHotel(hotel._id)"
              >
                <img
                  :src="hotel.IMAGES[0]"
                  class="carousel-image"
                  alt="Hotel Image"
                />
                <div class="overlay">
                  <h2 class="hotel-name">{{ hotel.NAME }}</h2>
                  <p class="hotel-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ hotel.ADDRESS.CITY }}
                  </p>
                  <div class="rating">
                    <span
                      v-for="index in 5"
                      :key="index"
                      class="star"
                      :style="getStarStyle(index, hotel.RATING)"
                      >⭐</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Điều khiển carousel -->
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#hotelCarousel"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#hotelCarousel"
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
import bannerProduct from "@/assets/pexels-ernesto-6178937.jpg";
import bannerProduct1 from "@/assets/pexels-pavel-danilyuk-9119786.jpg";
import bannerProduct2 from "@/assets/pexels-picasjoe-11363037.jpg";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";

export default {
  name: "BannerComponent",
  components: {
    DatePicker,
  },
  data() {
    const today = new Date().toISOString().split("T")[0];

    return {
      banners: [bannerProduct, bannerProduct1, bannerProduct2],
      currentIndex: 0,
      featuredHotels: [],
      destination: "",
      checkInDate: null,
      checkOutDate: null,
      rooms: 1,
      voucherCode: "",
      minDate: today,
      minCheckOutDate: null,
      hotelNames: [], // Danh sách khách sạn
      filteredHotelNames: [], // Danh sách khách sạn đã lọc
      showHotelSuggestions: false, // Trạng thái hiển thị gợi ý
      selectedHotelId: null,
    };
  },
  mounted() {
    this.fetchTopBookedHotels();
    this.fetchFeaturedHotels();
    this.fetchHotelNames();
    this.startCarousel();
    if (this.hotelId) {
      this.fetchHotelDetails();
    }
  },
  methods: {
    async fetchTopBookedHotels() {
      try {
        const response = await axiosClient.get("/hotels/getTopBookedHotels"); // API để lấy danh sách khách sạn được đặt nhiều nhất
        this.topBookedHotels = response.data.data.slice(0, 3); // Chỉ lấy 3 khách sạn hàng đầu
      } catch (error) {
        console.error("Lỗi khi lấy khách sạn được đặt nhiều nhất:", error);
      }
    },
    getStarStyle(index, rating) {
      const isFullStar = index <= Math.floor(rating);
      const isPartialStar = index === Math.ceil(rating) && !isFullStar;

      if (isFullStar) {
        return { color: "gold" };
      } else if (isPartialStar) {
        const percentage = (rating % 1) * 100 + "%";
        return {
          background: `linear-gradient(to right, gold ${percentage}, #ccc ${percentage})`,
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        };
      } else {
        return { color: "#ccc" };
      }
    },
    updateCheckOutMinDate() {
      if (this.checkInDate) {
        // Cập nhật ngày trả phòng phải lớn hơn ngày nhận phòng ít nhất 1 ngày
        const checkInDate = new Date(this.checkInDate);
        checkInDate.setDate(checkInDate.getDate() + 1); // Ngày trả phòng tối thiểu là 1 ngày sau ngày nhận phòng
        this.minCheckOutDate = checkInDate.toISOString().split("T")[0];
      }
    },

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
        this.featuredHotels = response.data.data;
        console.log("Dữ liệu khách sạn mới :", this.featuredHotels);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách sạn:", error);
      }
    },

    // async fetchFeaturedHotels() {
    //   try {
    //     const response = await axiosClient.get("/hotels/getAllHotels");
    //     this.featuredHotels = this.shuffleArray(response.data.data); // Trộn ngẫu nhiên danh sách khách sạn
    //   } catch (error) {
    //     console.error("Lỗi khi lấy dữ liệu khách sạn:", error);
    //   }
    // },

    async fetchHotelNames() {
      try {
        const response = await axiosClient.get("/hotels/getHotelsName");
        this.hotelNames = response.data.data;
        console.log("Hotel names response:", response.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tên khách sạn:", error);
      }
    },

    filterHotelNames() {
      const hotelPrefix = "ETHEREAL"; // Chuỗi cố định để tìm kiếm và cắt bỏ

      const normalizedInput = deburr(this.destination.toLowerCase()); // Loại bỏ dấu và chuyển thành chữ thường

      // Lọc danh sách khách sạn, chỉ hiển thị tên sau "Khách sạn ETHEREAL"
      if (normalizedInput === "") {
        // Nếu input trống, hiển thị toàn bộ danh sách khách sạn (chỉ phần tên sau "Khách sạn ETHEREAL")
        this.filteredHotelNames = this.hotelNames.map((hotel) => {
          if (hotel.NAME.includes(hotelPrefix)) {
            return {
              ...hotel,
              NAME: hotel.NAME.split(hotelPrefix)[1].trim(), // Cắt phần "Khách sạn ETHEREAL"
            };
          }
          return hotel; // Nếu không có "Khách sạn ETHEREAL" thì giữ nguyên
        });
      } else {
        // Lọc theo chuỗi nhập của người dùng và chỉ hiển thị tên sau "Khách sạn ETHEREAL"
        this.filteredHotelNames = this.hotelNames
          .filter((hotel) => {
            const normalizedHotelName = deburr(hotel.NAME.toLowerCase());
            return normalizedHotelName.includes(normalizedInput);
          })
          .map((hotel) => {
            if (hotel.NAME.includes(hotelPrefix)) {
              return {
                ...hotel,
                NAME: hotel.NAME.split(hotelPrefix)[1].trim(), // Cắt phần "Khách sạn ETHEREAL"
              };
            }
            return hotel; // Nếu không có "Khách sạn ETHEREAL" thì giữ nguyên
          });
      }
      this.showHotelSuggestions = true; // Hiển thị gợi ý
    },
    selectHotel(name) {
      const hotelPrefix = "ETHEREAL";
      let fullHotelName = `${hotelPrefix} ${name}`; // Tạo lại tên đầy đủ của khách sạn

      // Tìm khách sạn dựa trên tên đầy đủ
      const selectedHotel = this.hotelNames.find(
        (hotel) => hotel.NAME === fullHotelName
      );

      if (selectedHotel) {
        // Gán tên khách sạn và ID đã chọn
        this.destination = name; // Hiển thị tên rút gọn sau "Khách sạn ETHEREAL"
        this.selectedHotelId = selectedHotel._id; // Lưu ID của khách sạn đã chọn
      }

      this.showHotelSuggestions = false; // Ẩn danh sách gợi ý
    },

    hideSuggestionsWithDelay() {
      setTimeout(() => {
        this.showHotelSuggestions = false;
      }, 200); // Đợi một khoảng thời gian ngắn để cho phép click vào gợi ý
    },
    goToHotel(hotelId) {
      this.$router.push({ name: "HotelDetail", params: { id: hotelId } });
    },

    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Đổi chỗ các phần tử
      }
      return array;
    },

    async fetchHotelDetails() {
      try {
        const response = await axiosClient.get(
          `/hotels/getHotelById/${this.hotelId}`
        );
        this.hotel = response.data.data;
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách sạn:", error);
      }
    },
    async searchRooms() {
      const hotelIdToUse = this.selectedHotelId || this.hotelId;

      if (!this.destination) {
        this.$toast.warning("Bạn chưa chọn địa điểm.", {
          position: "top-right",
          duration: 3000,
        });
        return;
      }

      if (!hotelIdToUse) {
        console.error("Hotel ID is not selected.");
        return;
      }

      // Khi chỉ tìm theo địa điểm
      if (!this.checkInDate && !this.checkOutDate) {
        this.$router.push({
          name: "BookingPage",
          query: { hotelId: hotelIdToUse },
        });
        return;
      }

      // Khi tìm kiếm với địa điểm và thời gian
      try {
        const response = await axiosClient.post("/rooms/searchRooms", {
          hotelId: hotelIdToUse,
          checkInDate: this.checkInDate,
          checkOutDate: this.checkOutDate,
          numberOfRooms: this.rooms,
        });

        if (response.data.success) {
          this.availableRooms = response.data.data;
          this.hotelId = hotelIdToUse;
          this.startDate = this.checkInDate;
          this.endDate = this.checkOutDate;

          // Chuyển hướng đến trang BookingPage với đầy đủ tham số
          this.$router.push({
            name: "BookingPage",
            query: {
              hotelId: hotelIdToUse,
              checkInDate: this.checkInDate,
              checkOutDate: this.checkOutDate,
              numberOfRooms: this.rooms,
            },
          });
        } else {
          this.$toast.error("Không thể tìm thấy phòng phù hợp.");
        }
      } catch (error) {
        console.error("Lỗi khi tìm phòng:", error);
        this.$toast.error("Đã xảy ra lỗi trong quá trình tìm kiếm.");
      }
    },
  },
  computed: {
    chunkedHotels() {
      // Chia danh sách khách sạn đã trộn ngẫu nhiên thành các nhóm 6 khách sạn
      const chunkSize = 6;
      const chunks = [];
      for (let i = 0; i < this.featuredHotels.length; i += chunkSize) {
        chunks.push(this.featuredHotels.slice(i, i + chunkSize));
      }
      return chunks;
    },
  },
};
</script>

<style scoped>
@import "./HomeUser.scss";
</style>
