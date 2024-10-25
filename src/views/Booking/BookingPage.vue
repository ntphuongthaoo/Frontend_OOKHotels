<template>
  <div class="main">
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

        <!-- Ngày nhận - trả phòng -->
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
          <p class="time" v-if="startDate && endDate">
            {{ formattedStartDate }} - {{ formattedEndDate }} ({{
              nightsCount + 1
            }}
            ngày)
          </p>
          <p class="error-message" v-else>Bạn chưa chọn ngày nhận/trả phòng.</p>

          <h4>Thông tin phòng</h4>
          <div v-if="selectedRoom">
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

          <div v-else>
            <p class="error-message">
              Vui lòng chọn phòng trước khi thanh toán.
            </p>
          </div>

          <div class="total-info-book">
            <div>Tổng cộng:</div>
            <div class="total-book">
              {{ calculateTotalPrice().toLocaleString() }} VNĐ
            </div>
          </div>

          <!-- Nút đặt ngay -->
          <button
            class="confirm-booking-btn"
            :disabled="!selectedRoom || !checkInDate || !checkOutDate"
            :class="{
              'disabled-btn': !selectedRoom || !checkInDate || !checkOutDate,
            }"
            @click="confirmBooking"
          >
            Đặt ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import { deburr } from "lodash";

export default {
  props: ["hotelId", "roomType", "roomNumbers"],
  components: {
    DatePicker,
  },
  data() {
    const today = new Date().toISOString().split("T")[0];

    return {
      hotelId: null,
      hotel: {
        ADDRESS: {},
        IMAGES: [],
      },
      availableRooms: [],
      selectedRoom: null,
      startDate: null,
      endDate: null,
      checkInDate: null,
      checkOutDate: null,
      minDate: today,
      minCheckOutDate: null,
      hotelNames: [], // Danh sách khách sạn
      filteredHotelNames: [], // Danh sách khách sạn đã lọc
      showHotelSuggestions: false,
      rooms: 1,
    };
  },
  mounted() {
    const {
      hotelId,
      checkInDate,
      checkOutDate,
      startDate,
      endDate,
      numberOfRooms,
    } = this.$route.query;

    // Nếu dữ liệu từ thanh tìm kiếm
    if (hotelId) {
      this.hotelId = hotelId;
      if (checkInDate && checkOutDate) {
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.startDate = checkInDate; // Đồng bộ ngày nhận phòng
        this.endDate = checkOutDate; // Đồng bộ ngày trả phòng
        this.rooms = Number(numberOfRooms) || 1;
        this.fetchAvailableRoomsSearch();
      } else {
        this.fetchAllRoomsByHotel();
      }
    }

    // Kiểm tra nếu query có giá trị từ nút "Đặt phòng"
    if (hotelId && startDate && endDate) {
      this.hotelId = hotelId;
      this.startDate = startDate;
      this.endDate = endDate;
      this.checkInDate = startDate; // Đồng bộ ngày check-in
      this.checkOutDate = endDate;
      this.rooms = Number(numberOfRooms) || 1;

      console.log("Calling fetchAvailableRooms...");
      this.fetchAvailableRooms(); // Gọi hàm lấy danh sách phòng từ modal lịch
    }

    this.fetchHotelDetails();
    this.fetchHotelNames();
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
    async fetchAllRoomsByHotel() {
      try {
        const response = await axiosClient.get(
          `/rooms/getAllRoomsInHotel/${this.hotelId}`
        );
        if (response.data.success) {
          this.availableRooms = response.data.rooms;
        } else {
          this.$toast.error("Không thể lấy danh sách phòng.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy tất cả phòng:", error);
        this.$toast.error("Lỗi xảy ra khi lấy danh sách phòng.");
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
    confirmBooking() {
      if (this.selectedRoom) {
        // Lưu thông tin đặt phòng vào Vuex Store
        this.$store.commit("SET_BOOKING_DETAIL", {
          hotel: this.hotel,
          room: this.selectedRoom,
          startDate: this.startDate,
          endDate: this.endDate,
          nightsCount: this.nightsCount,
          totalPrice: this.calculateTotalPrice(),
        });

        // Chuyển hướng đến trang thanh toán
        this.$router.push({ name: "PaymentPage" });
      }
    },
    viewRoomAmenities(room) {
      // Logic hiển thị tiện nghi phòng, hoặc bạn có thể chỉ cần console log ra để kiểm tra
      console.log("Hiển thị tiện nghi của phòng:", room);
    },
    viewHotelDetails(hotelId) {
      // Điều hướng đến trang chi tiết khách sạn với ID
      this.$router.push(`/home/hotel/${hotelId}`);
    },

    async fetchHotelDetails() {
      try {
        console.log("Hotel ID:", this.hotelId);
        const response = await axiosClient.get(
          `/hotels/getHotelById/${this.hotelId}`
        );
        this.hotel = response.data.data;

        const hotelName = this.hotel.NAME.replace("ETHEREAL", "").trim();
        this.destination = hotelName;
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
    async fetchAvailableRoomsSearch() {
      try {
        // Kiểm tra nếu các giá trị đã được lấy thành công từ route
        if (this.hotelId && this.checkInDate && this.checkOutDate) {
          console.log(
            "Calling API with:",
            this.hotelId,
            this.checkInDate,
            this.checkOutDate,
            this.rooms
          );
          const response = await axiosClient.post("/rooms/searchRooms", {
            hotelId: this.hotelId,
            checkInDate: this.checkInDate,
            checkOutDate: this.checkOutDate,
            numberOfRooms: this.rooms,
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

      if (normalizedInput === "") {
        // Nếu input trống, hiển thị toàn bộ danh sách khách sạn (chỉ phần tên sau "Khách sạn ETHEREAL")
        this.filteredHotelNames = this.hotelNames.map((hotel) => {
          if (hotel.NAME.includes(hotelPrefix)) {
            return {
              ...hotel,
              NAME: hotel.NAME.split(hotelPrefix)[1].trim(), // Cắt phần "Khách sạn ETHEREAL"
            };
          }
          return hotel;
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
                NAME: hotel.NAME.split(hotelPrefix)[1].trim(),
              };
            }
            return hotel;
          });
      }
      this.showHotelSuggestions = true; // Hiển thị gợi ý
    },

    selectHotel(name) {
      const hotelPrefix = "ETHEREAL";
      let fullHotelName = `${hotelPrefix} ${name}`; // Tạo lại tên đầy đủ của khách sạn

      const selectedHotel = this.hotelNames.find(
        (hotel) => hotel.NAME === fullHotelName
      );

      if (selectedHotel) {
        this.destination = name;
        this.selectedHotelId = selectedHotel._id; // Lưu ID của khách sạn đã chọn
      }

      this.showHotelSuggestions = false; // Ẩn danh sách gợi ý
    },

    hideSuggestionsWithDelay() {
      setTimeout(() => {
        this.showHotelSuggestions = false;
      }, 200);
    },

    async searchRooms() {
      const hotelIdToUse = this.selectedHotelId || this.hotelId;
      // Kiểm tra nếu người dùng đã chọn khách sạn
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

      try {
        // Gọi API để tìm phòng phù hợp cho khách sạn đã được chọn
        const response = await axiosClient.post("/rooms/searchRooms", {
          hotelId: hotelIdToUse,
          checkInDate: this.checkInDate,
          checkOutDate: this.checkOutDate,
          numberOfRooms: this.rooms,
        });

        if (response.data.success) {
          // Cập nhật danh sách phòng có sẵn
          this.availableRooms = response.data.data;

          this.hotelId = hotelIdToUse; // Cập nhật hotelId với ID khách sạn đã chọn
          this.fetchHotelDetails();

          this.startDate = this.checkInDate;
          this.endDate = this.checkOutDate;
        } else {
          this.$toast.error("Không thể tìm thấy phòng phù hợp.", {
            position: "top-right",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Lỗi khi tìm phòng:", error);
        this.$toast.error("Đã xảy ra lỗi trong quá trình tìm kiếm.", {
          position: "top-right",
          duration: 3000,
        });
      }
    },
  },
  watch: {
    checkInDate(newVal, oldVal) {
      // Khi giá trị ngày nhận phòng thay đổi, gọi lại hàm searchRooms
      if (newVal !== oldVal && this.selectedHotelId) {
        this.searchRooms();
      }
    },
    checkOutDate(newVal, oldVal) {
      // Khi giá trị ngày trả phòng thay đổi, gọi lại hàm searchRooms
      if (newVal !== oldVal && this.selectedHotelId) {
        this.searchRooms();
      }
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
  background: #a06e5c;
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
  color: #fff;
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
  background-color: #6d4c41;
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
  width: 16%;
  z-index: 1000; /* Tăng z-index để đảm bảo nằm trên cùng */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Thêm đổ bóng để nổi bật */
  top: 92px;
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
  background-color: #a06e5c; /* Màu nâu khi nút kích hoạt */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm-booking-btn.disabled-btn {
  background-color: #ccc; /* Màu xám khi nút bị vô hiệu hóa */
  cursor: not-allowed; /* Thay đổi con trỏ khi nút bị vô hiệu hóa */
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
  background-color: #a06e5c;
  color: #fff;
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
