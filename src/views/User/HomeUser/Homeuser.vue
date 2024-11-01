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

    <!-- Khách sạn nổi bật -->
    <div class="container featured-hotels">
      <h2 class="text-center title-our-hotels">KHÁCH SẠN CỦA CHÚNG TÔI</h2>
      <div id="featuredCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div
            v-for="(chunk, index) in chunkedHotels"
            :key="index"
            class="carousel-item"
            :class="{ active: index === 0 }"
          >
            <!-- Slide đầu tiên: 2 ảnh nhỏ, 1 ảnh lớn, 2 ảnh nhỏ -->
            <div v-if="chunk.type === 'first'" class="row gx-0">
              <div class="col-md-4 d-flex flex-column group-card">
                <div
                  class="small-card flex-fill"
                  v-for="(hotel, idx) in chunk.left"
                  :key="idx"
                  @click="goToHotel(hotel._id)"
                >
                  <img :src="hotel.IMAGES" class="card-img" :alt="hotel.NAME" />
                  <h5 class="card-title">{{ hotel.NAME }}</h5>
                </div>
              </div>
              <div class="col-md-4 big-card group-card">
                <div class="big-card" @click="goToHotel(chunk.middle._id)">
                  <img
                    :src="chunk.middle.IMAGES"
                    class="card-img big-img"
                    :alt="chunk.middle.NAME"
                  />
                  <h5 class="card-title">{{ chunk.middle.NAME }}</h5>
                </div>
              </div>
              <div class="col-md-4 d-flex flex-column group-card">
                <div
                  class="small-card flex-fill"
                  v-for="(hotel, idx) in chunk.right"
                  :key="idx"
                  @click="goToHotel(hotel._id)"
                >
                  <img :src="hotel.IMAGES" class="card-img" :alt="hotel.NAME" />
                  <h5 class="card-title">{{ hotel.NAME }}</h5>
                </div>
              </div>
            </div>

            <!-- Slide thứ hai: 1 ảnh lớn từ slide trước, 2 ảnh nhỏ từ slide trước, 1 ảnh lớn mới -->
            <div v-else-if="chunk.type === 'second'" class="row gx-0">
              <div class="col-md-4 big-card group-card">
                <div class="big-card" @click="goToHotel(chunk.middle._id)">
                  <img
                    :src="chunk.middle.IMAGES"
                    class="card-img big-img"
                    :alt="chunk.middle.NAME"
                  />
                  <h5 class="card-title">{{ chunk.middle.NAME }}</h5>
                </div>
              </div>
              <div class="col-md-4 d-flex flex-column group-card">
                <div
                  class="small-card flex-fill"
                  v-for="(hotel, idx) in chunk.left"
                  :key="idx"
                  @click="goToHotel(hotel._id)"
                >
                  <img :src="hotel.IMAGES" class="card-img" :alt="hotel.NAME" />
                  <h5 class="card-title">{{ hotel.NAME }}</h5>
                </div>
              </div>
              <div class="col-md-4 big-card group-card">
                <div class="big-card" @click="goToHotel(chunk.right[0]._id)">
                  <img
                    :src="chunk.right[0].IMAGES"
                    class="card-img big-img"
                    :alt="chunk.right[0].NAME"
                  />
                  <h5 class="card-title">{{ chunk.right[0].NAME }}</h5>
                </div>
              </div>
            </div>

            <!-- Slide thứ ba: 2 ảnh nhỏ từ slide trước, 1 ảnh lớn từ slide trước, 2 ảnh nhỏ mới -->
            <div v-else-if="chunk.type === 'third'" class="row gx-0">
              <div class="col-md-4 d-flex flex-column group-card">
                <div
                  class="small-card flex-fill"
                  v-for="(hotel, idx) in chunk.left"
                  :key="idx"
                  @click="goToHotel(hotel._id)"
                >
                  <img :src="hotel.IMAGES" class="card-img" :alt="hotel.NAME" />
                  <h5 class="card-title">{{ hotel.NAME }}</h5>
                </div>
              </div>
              <div class="col-md-4 big-card group-card">
                <div class="big-card" @click="goToHotel(chunk.middle._id)">
                  <img
                    :src="chunk.middle.IMAGES"
                    class="card-img big-img"
                    :alt="chunk.middle.NAME"
                  />
                  <h5 class="card-title">{{ chunk.middle.NAME }}</h5>
                </div>
              </div>
              <div class="col-md-4 d-flex flex-column group-card">
                <div
                  class="small-card flex-fill"
                  v-for="(hotel, idx) in chunk.right"
                  :key="idx"
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
    this.fetchFeaturedHotels();
    this.fetchHotelNames();
    this.startCarousel();
    if (this.hotelId) {
      this.fetchHotelDetails();
    }
  },
  methods: {
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
      if (
        !Array.isArray(this.featuredHotels) ||
        this.featuredHotels.length < 5
      ) {
        return [];
      }

      const chunks = [];
      let startIndex = 0;

      // Slide đầu tiên: 2 ảnh nhỏ, 1 ảnh lớn, 2 ảnh nhỏ
      while (startIndex < this.featuredHotels.length) {
        if (chunks.length === 0) {
          // Slide đầu tiên
          const left = this.featuredHotels.slice(startIndex, startIndex + 2); // 2 ảnh nhỏ
          const middle = this.featuredHotels[startIndex + 2]; // 1 ảnh lớn
          const right = this.featuredHotels.slice(
            startIndex + 3,
            startIndex + 5
          ); // 2 ảnh nhỏ

          if (left.length === 2 && middle && right.length === 2) {
            chunks.push({ type: "first", left, middle, right });
            startIndex += 5; // Đã sử dụng 5 ảnh
          } else {
            break;
          }
        } else if (chunks.length % 2 !== 0) {
          // Slide thứ hai: 1 ảnh lớn từ slide trước, 2 ảnh nhỏ từ slide trước, 1 ảnh lớn mới
          const prevMiddle = chunks[chunks.length - 1].middle; // 1 ảnh lớn từ slide trước
          const prevRight = chunks[chunks.length - 1].right; // 2 ảnh nhỏ từ slide trước
          const newMiddle = this.featuredHotels[startIndex]; // 1 ảnh lớn mới

          if (prevMiddle && prevRight.length === 2 && newMiddle) {
            chunks.push({
              type: "second",
              middle: prevMiddle,
              left: prevRight,
              right: [newMiddle],
            });
            startIndex += 1; // Đã sử dụng thêm 1 ảnh
          } else {
            break;
          }
        } else {
          // Slide thứ ba: 2 ảnh nhỏ từ slide trước, 1 ảnh lớn từ slide trước, 2 ảnh nhỏ mới
          const prevLeft = chunks[chunks.length - 1].left; // 2 ảnh nhỏ từ slide trước
          const prevMiddle = chunks[chunks.length - 1].right[0]; // 1 ảnh lớn từ slide trước
          const newRight = this.featuredHotels.slice(
            startIndex,
            startIndex + 2
          ); // 2 ảnh nhỏ mới

          if (prevLeft.length === 2 && prevMiddle && newRight.length === 2) {
            chunks.push({
              type: "third",
              left: prevLeft,
              middle: prevMiddle,
              right: newRight,
            });
            startIndex += 2; // Đã sử dụng thêm 2 ảnh
          } else {
            break;
          }
        }
      }

      return chunks;
    },
  },
};
</script>

<style scoped>
@import "./HomeUser.scss";
</style>
