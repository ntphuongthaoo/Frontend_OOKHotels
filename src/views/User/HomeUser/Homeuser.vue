<template>
  <div>
    <!-- Carousel với hình ảnh khách sạn -->
    <div
      id="carouselExampleIndicators"
      class="carousel slide"
      data-bs-ride="carousel"
    >
      <div class="carousel-indicators">
        <button
          v-for="(image, index) in images"
          :key="index"
          :data-bs-target="'#carouselExampleIndicators'"
          :data-bs-slide-to="index"
          :class="{ active: index === 0 }"
          :aria-label="'Slide ' + (index + 1)"
        ></button>
      </div>
      <div class="carousel-inner">
        <div
          v-for="(image, index) in images"
          :key="index"
          :class="['carousel-item', { active: index === 0 }]"
        >
          <img :src="image.src" class="d-block w-100" :alt="image.alt" />
          <div class="carousel-caption d-none d-md-block">
            <h5>{{ image.title }}</h5>
            <p>{{ image.description }}</p>
          </div>
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

    <!-- Khách sạn nổi bật -->
    <div class="container featured-hotels">
      <h2 class="text-center">KHÁCH SẠN NỔI BẬT</h2>
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
              <div class="col-md-4 d-flex flex-column">
                <div
                  class="small-card flex-fill"
                  v-for="hotel in chunk.left"
                  :key="hotel._id"
                  @click="goToHotel(hotel._id)"
                >
                  <img
                    :src="hotel.IMAGE"
                    class="card-img"
                    :alt="hotel.NAME"
                  />
                  <h5 class="card-title">{{ hotel.NAME }}</h5>
                </div>
              </div>

              <!-- Tấm lớn ở giữa -->
              <div class="col-md-4">
                <div
                  class="big-card h-100"
                  @click="goToHotel(chunk.middle._id)"
                >
                  <img
                    :src="chunk.middle.IMAGE"
                    class="card-img big-img h-100"
                    :alt="chunk.middle.NAME"
                  />
                  <h5 class="card-title">{{ chunk.middle.NAME }}</h5>
                </div>
              </div>

              <!-- Hai tấm bên phải -->
              <div class="col-md-4 d-flex flex-column">
                <div
                  class="small-card flex-fill"
                  v-for="hotel in chunk.right"
                  :key="hotel._id"
                  @click="goToHotel(hotel._id)"
                >
                  <img
                    :src="hotel.IMAGE"
                    class="card-img"
                    :alt="hotel.NAME"
                  />
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
import bg1 from "@/assets/bg_1.jpg";
import bg2 from "@/assets/bg_2.jpg";
import bg3 from "@/assets/bg_3.jpg";
import axiosClient from "../../../api/axiosClient";

export default {
  name: "BannerComponent",
  data() {
    return {
      featuredHotels: [],
      destination: "",
      checkInDate: "",
      checkOutDate: "",
      rooms: 1,
      voucherCode: "",
      images: [
        {
          src: bg1,
          alt: "Hotel Image 1",
          title: "Hotel Luxury 1",
          description:
            "Trải nghiệm kỳ nghỉ sang trọng tại khách sạn của chúng tôi.",
        },
        {
          src: bg2,
          alt: "Hotel Image 2",
          title: "Hotel Luxury 2",
          description:
            "Tận hưởng không gian thoải mái và đẹp mắt tại khách sạn của chúng tôi.",
        },
        {
          src: bg3,
          alt: "Hotel Image 3",
          title: "Hotel Luxury 3",
          description:
            "Thư giãn và tận hưởng phong cảnh đẹp tại khách sạn của chúng tôi.",
        },
      ],
    };
  },
  mounted() {
    this.fetchFeaturedHotels();
  },
  methods: {
    async fetchFeaturedHotels() {
      try {
        const response = await axiosClient.get("/hotels/getAllHotels");
        console.log("Dữ liệu khách sạn:", response.data);
        this.featuredHotels = response.data.data; 
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách sạn:", error);
      }
    },
    goToHotel(hotelId) {
      this.$router.push({ name: 'HotelDetail', params: { id: hotelId } })
    },
    searchRooms() {
      console.log({
        destination: this.destination,
        checkInDate: this.checkInDate,
        checkOutDate: this.checkOutDate,
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
