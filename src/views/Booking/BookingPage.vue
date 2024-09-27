<template>
  <div>
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
    <h1>Thông tin các phòng thuộc phòng đại diện</h1>
    <div v-for="room in availableRooms" :key="room._id">
      <h3>
        Phòng {{ room.ROOM_NUMBER }} - {{ room.CUSTOM_ATTRIBUTES.bedType }}
      </h3>
      <p>Giá: {{ room.PRICE_PERNIGHT }} VND/đêm</p>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";

export default {
  props: ["hotelId", "roomType", "roomNumbers"],
  data() {
    return {
      hotel: {
        ADDRESS: {},
        IMAGES: [],
      },
      availableRooms: [],
    };
  },
  mounted() {
    this.fetchHotelDetails();
    this.fetchRoomDetails();
  },
  computed: {
    isDescriptionTruncated() {
      const maxLength = 352;
      return this.hotel.DESCRIPTION && this.hotel.DESCRIPTION.length > maxLength;
    },
    truncatedDescription() {
      const maxLength = 352;
      return this.hotel.DESCRIPTION ? this.hotel.DESCRIPTION.substring(0, maxLength) : '';
    },
  },
  methods: {
    viewHotelDetails(hotelId) {
      // Điều hướng đến trang chi tiết khách sạn với ID
      this.$router.push(`/trangchu/khach-san/${hotelId}`);
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
    async fetchRoomDetails() {
      try {
        const roomIds = this.roomNumbers.split(","); // Lấy danh sách số phòng từ query
        const response = await axiosClient.post("/rooms/getRoomsByNumbers", {
          hotelId: this.hotelId,
          roomNumbers: roomIds, // Truyền danh sách số phòng cần lấy thông tin
        });
        this.availableRooms = response.data.data; // Lưu các phòng trống tương ứng với phòng đại diện
      } catch (error) {
        console.error("Lỗi khi lấy thông tin phòng:", error);
      }
    },
  },
};
</script>

<style scoped>
.hotel-info-card {
  display: flex;
  border: 1px solid #e0e0e0;
  /* border-radius: 10px; */
  background-color: #fff;
  overflow: hidden;
  margin-bottom: 20px;
  /* width: 500px; */
  height: 250px; /* Giảm chiều cao */
  margin: 20px 60px;
}

.hotel-image {
  position: relative;
  flex: 0 0 20%;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding: 10px;
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
  padding: 10px;
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
</style>
