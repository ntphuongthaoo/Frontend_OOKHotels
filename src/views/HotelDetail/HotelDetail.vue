<template>
  <div>
    <div
      id="carouselExampleIndicators"
      class="carousel slide"
      data-bs-ride="carousel"
    >
      <div class="carousel-inner">
        <div
          v-for="(image, index) in hotel.IMAGES"
          :key="index"
          :class="['carousel-item', { active: index === 0 }]"
        >
          <!-- Hiển thị chỉ hình ảnh -->
          <img :src="image" class="d-block w-100" />
        </div>
      </div>
    </div>

    <!-- Thông tin khách sạn -->
    <div class="container hotel-details">
      <h1>{{ hotel.NAME }}</h1>
      <p class="address">
        <i class="fa fa-compass" aria-hidden="true"></i>
        {{ hotel.ADDRESS.ADDRESS_LINE }}, {{ hotel.ADDRESS.WARD }},
        {{ hotel.ADDRESS.DISTRICT }}, {{ hotel.ADDRESS.CITY }},
        {{ hotel.ADDRESS.COUNTRY }}
      </p>
      <p>
        <i class="fa fa-phone" aria-hidden="true"></i>
        <strong class="phone">Phone:</strong> {{ hotel.PHONE }}
      </p>
      <p>
        <i class="fa fa-envelope" aria-hidden="true"></i>
        <strong class="email">Email: </strong>
        <a :href="'mailto:' + hotel.EMAIL">{{ hotel.EMAIL }}</a>
      </p>
      <div class="description" v-html="hotel.DESCRIPTION"></div>
    </div>

    <!-- Hiển thị các hạng phòng -->
    <div class="container room-types">
      <h2>CÁC HẠNG PHÒNG</h2>
      <div
        v-for="(roomGroup, type) in groupedRooms"
        :key="type"
        class="room-type"
      >
        <!-- Hiển thị loại phòng và số phòng -->
        <h3>
          <i class="fa fa-bed" aria-hidden="true"></i>
          Loại phòng: {{ type }}
        </h3>
        <p>
          <!-- Hiển thị các số phòng, áp dụng lớp highlight nếu bedType và type đang được hover -->
          <span
            v-for="roomNumber in roomGroup.roomNumbers"
            :key="roomNumber"
            :class="{ highlighted: isHighlighted(roomNumber, type) }"
            @click="showRoomInfo(roomNumber, type)"
          >
            {{ roomNumber }}
          </span>
        </p>

        <!-- Hiển thị các phòng đại diện theo loại giường, tối đa 3 phòng trên một hàng -->
        <div class="rooms" style="display: flex; gap: 20px; flex-wrap: wrap">
          <div
            v-for="(rooms, bedType) in roomGroup.bedTypeGroups"
            :key="bedType"
            class="room"
            style="flex: 0 0 33%; max-width: 33%"
            @mouseover="hoverBedType(type, bedType)"
            @mouseleave="hoverBedType(null, null)"
          >
            <img
              v-if="rooms[0]?.IMAGES && rooms[0].IMAGES.length > 0"
              :src="rooms[0].IMAGES[0]"
              class="room-image"
              alt="Room Image"
            />
            <h4>
              {{ rooms[0].TYPE }} {{ rooms[0].CUSTOM_ATTRIBUTES.bedType }}
            </h4>
            <p>Diện tích: {{ rooms[0].CUSTOM_ATTRIBUTES.area }}m²</p>
            <p>Giá: {{ rooms[0].PRICE_PERNIGHT }} VND/đêm</p>
            <p>
              Số người: {{ rooms[0].CUSTOM_ATTRIBUTES.number_of_people }} người
            </p>
            <div class="room-actions">
              <button
                class="book-now"
                @click="openBookingModal(roomGroup, 'book')"
              >
                Đặt ngay
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal hiển thị thông tin phòng -->
      <div v-if="selectedRoom" class="room-modal">
        <div class="room-modal-content">
          <span class="close" @click="closeRoomInfo">&times;</span>
          <div class="room-details">
            <!-- Phần hình ảnh phòng chiếm 3/4 chiều rộng -->
            <div class="room-images">
              <img
                v-if="selectedRoom?.IMAGES && selectedRoom.IMAGES.length > 0"
                :src="selectedRoom.IMAGES[mainImageIndex]"
                alt="Room Image"
                class="main-image"
              />
              <div class="thumbnail-images">
                <img
                  v-for="(image, index) in selectedRoom.IMAGES"
                  :src="image"
                  :key="index"
                  @click="changeMainImage(index)"
                  :class="{ 'selected-thumbnail': mainImageIndex === index }"
                  class="thumbnail-image"
                />
              </div>
            </div>

            <!-- Phần thông tin phòng chiếm 1/4 chiều rộng -->
            <div class="room-info">
              <h3>
                Phòng {{ selectedRoom.TYPE }} -
                {{ selectedRoom.CUSTOM_ATTRIBUTES.bedType }}
              </h3>
              <hr />
              <p>{{ selectedRoom.DESCRIPTION }}</p>
              <h4>Tiện nghi của phòng</h4>
              <ul class="amenities-list">
                <li
                  v-for="(amenity, index) in amenitiesList(
                    selectedRoom.CUSTOM_ATTRIBUTES.amenities
                  )"
                  :key="index"
                >
                  <i :class="getAmenityIcon(amenity)" aria-hidden="true"></i>
                  {{ amenity }}
                </li>
              </ul>
              <hr />
              <h4>Thông tin chi tiết</h4>
              <p><strong>Số phòng:</strong> {{ selectedRoom.ROOM_NUMBER }}</p>
              <p>
                <strong>Diện tích:</strong>
                {{ selectedRoom.CUSTOM_ATTRIBUTES.area }} m²
              </p>
              <p>
                <strong>Giá:</strong> {{ selectedRoom.PRICE_PERNIGHT }} VND/đêm
              </p>
              <p>
                <strong>Số người:</strong>
                {{ selectedRoom.CUSTOM_ATTRIBUTES.number_of_people }} người
              </p>
              <div class="action">
                <button
                  @click="openCalendarModalForRoom(selectedRoom, 'addToCart')"
                  class="cart"
                  :disabled="selectedRoom?.IS_IN_CART || false"
                >
                  <i class="fa fa-cart-plus" aria-hidden="true"></i>
                </button>
                <button
                  @click="openCalendarModalForRoom(selectedRoom, 'bookNow')"
                >
                  Đặt ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal chọn ngày -->
    <div v-if="isCalendarModalVisible" class="calendar-modal">
      <div class="calendar-modal-content">
        <span class="close" @click="closeCalendarModal">&times;</span>
        <h2>Chọn ngày đặt phòng</h2>
        <!-- Nút chuyển tháng -->
        <div class="month-navigation">
          <button @click="prevMonth" :disabled="isPrevMonthDisabled">
            &lt; Tháng trước
          </button>
          <span>{{ formattedCurrentMonth }}</span>
          <button @click="nextMonth">&gt; Tháng sau</button>
        </div>
        <!-- Hiển thị lịch ở đây -->
        <div class="calendar-container">
          <table class="calendar-table">
            <!-- Hiển thị tiêu đề ngày trong tuần -->
            <thead>
              <tr>
                <th>CN</th>
                <th>T2</th>
                <th>T3</th>
                <th>T4</th>
                <th>T5</th>
                <th>T6</th>
                <th>T7</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(week, index) in calendar" :key="index">
                <td
                  v-for="day in week"
                  :key="day.date"
                  :class="{
                    disabled: day.isPast,
                    selected: isSelectedDate(day.date),
                  }"
                  @click="selectDate(day)"
                >
                  {{ day.label }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="selected-dates">
          <div class="date-range">
            <label>Ngày nhận - trả phòng:</label>
            <div class="date-display">
              {{ formatDate(selectedStartDate) }} -
              {{ formatDate(selectedEndDate) }}
            </div>
          </div>
        </div>

        <!-- Nút xác nhận -->
        <button class="confirm-button" @click="confirmDates">Xác nhận</button>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import Swal from "sweetalert2";

export default {
  props: ["id"],
  name: "HotelDetail",
  components: {
    "vue-datepicker-next": DatePicker, // Đăng ký component
  },
  data() {
    return {
      minDate: new Date().toISOString().split("T")[0],
      hotel: {
        ADDRESS: {},
        IMAGES: [],
      },
      roomList: [],
      hotelName: "", // Tên khách sạn
      hoveredRoomGroup: null,
      selectedRoom: null,
      mainImageIndex: 0,
      availableRooms: [],
      isCalendarModalVisible: false, // Trạng thái hiển thị modal lịch
      selectedStartDate: "", // Ngày bắt đầu được chọn
      selectedEndDate: "",
      currentDate: new Date(),
      currentAction: "",
    };
  },
  mounted() {
    console.log(this.id);
    this.fetchHotelDetails();
    this.fetchHotelNames();
    this.fetchRooms();
    this.destination = this.hotel.NAME;
  },
  methods: {
    formatDateRange(startDate, endDate) {
      if (!startDate || !endDate) return "";
      const start = startDate.toLocaleDateString("vi-VN");
      const end = endDate.toLocaleDateString("vi-VN");
      return `${start} - ${end}`;
    },
    prevMonth() {
      if (this.isPrevMonthDisabled) {
        return; // Nếu nút bị vô hiệu hóa, không làm gì cả
      }
      const prevMonthDate = new Date(this.currentDate);
      prevMonthDate.setMonth(this.currentDate.getMonth() - 1);
      this.currentDate = prevMonthDate;
    },

    // Chuyển sang tháng sau
    nextMonth() {
      const nextMonthDate = new Date(this.currentDate);
      nextMonthDate.setMonth(this.currentDate.getMonth() + 1);
      this.currentDate = nextMonthDate;
    },

    openCalendarModalForRoom(room, action) {
      if (!this.isLoggedIn) {
        this.$router.push({
          name: "Login", // Tên của route đăng nhập
          query: { redirect: this.$route.fullPath }, // Lưu trang hiện tại để chuyển lại sau khi đăng nhập
        });
        return;
      }
      this.selectedRoom = room; // Lưu phòng được chọn
      this.currentAction = action; // Lưu hành động hiện tại
      this.openCalendarModal(); // Mở modal lịch
    },
    hoverBedType(type, bedType) {
      if (type && bedType) {
        // Cập nhật loại phòng và bedType đang được hover
        this.hoveredRoomGroup = { type, bedType };
      } else {
        this.hoveredRoomGroup = null; // Reset khi không hover
      }
    },
    getBedType(roomNumber, type) {
      // Tìm và trả về bedType của phòng dựa trên roomNumber và type
      const room = this.roomList.find(
        (room) => room.ROOM_NUMBER === roomNumber && room.TYPE === type
      );
      return room ? room.CUSTOM_ATTRIBUTES.bedType : null;
    },
    isHighlighted(roomNumber, type) {
      // Kiểm tra nếu phòng có số phòng và loại phòng tương ứng với trạng thái hover
      const bedType = this.getBedType(roomNumber, type);
      return (
        this.hoveredRoomGroup &&
        this.hoveredRoomGroup.type === type &&
        this.hoveredRoomGroup.bedType === bedType
      );
    },
    showRoomInfo(roomNumber, type) {
      this.selectedRoom = this.roomList.find(
        (room) => room.ROOM_NUMBER === roomNumber && room.TYPE === type
      );
      this.mainImageIndex = 0; // Đặt lại hình ảnh chính khi mở modal
    },
    closeRoomInfo() {
      this.selectedRoom = null; // Đóng modal
    },
    changeMainImage(index) {
      this.mainImageIndex = index; // Thay đổi hình ảnh chính khi click vào hình nhỏ
    },

    openBookingModal(action) {
      if (!this.isLoggedIn) {
        this.$router.push({
          name: "Login",
          query: { redirect: this.$route.fullPath },
        });
        return;
      }
      this.currentAction = "book";

      // Mở modal chọn ngày
      this.openCalendarModal();
    },

    async addToCart(room, startDate, endDate) {
      try {
        // Gửi yêu cầu thêm phòng vào giỏ hàng
        const response = await axiosClient.post("/carts/addRoomToCart", {
          roomId: room._id,
          startDate: startDate,
          endDate: endDate,
        });

        // Kiểm tra nếu thêm phòng thành công
        if (response.data.success) {
          await this.fetchRooms();
          
          Swal.fire({
            icon: "success",
            title: "Thành công",
            text: "Thêm phòng vào giỏ hàng thành công.",
            confirmButtonText: "OK",
          });

          await this.$store.dispatch("fetchCart");
        } else {
          // Hiển thị thông báo lỗi khác (nếu có)
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: response.data.message,
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        // Xử lý lỗi khi gửi yêu cầu
        if (error.response && error.response.data.message) {
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: error.response.data.message,
            confirmButtonText: "OK",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Có lỗi xảy ra khi thêm phòng vào giỏ hàng.",
            confirmButtonText: "OK",
          });
        }
        console.error("Lỗi thêm phòng vào giỏ hàng:", error);
      }
    },

    amenitiesList(amenities) {
      return amenities.split(", ");
    },
    getAmenityIcon(amenity) {
      // Trả về lớp CSS cho icon tương ứng với tiện nghi
      const icons = {
        "Tủ quần áo": "fa fa-archive",
        "Máy sấy tóc": "fa fa-wind",
        "Phòng có bồn tắm": "fa fa-bath",
        "Dịch vụ giặt ủi": "fa fa-tshirt",
        Wifi: "fa fa-wifi",
        "Phòng không hút thuốc": "fa fa-ban-smoking",
        "Vòi sen": "fa fa-shower",
        "Quầy bar mini": "fa fa-wine-glass",
        "Khăn tắm": "fa fa-towel",
        "Điện thoại": "fa fa-phone",
        "Đèn bàn": "fa fa-lightbulb",
        "Bàn làm việc": "fa fa-desk",
        "Ga trải giường, gối": "fa fa-bed",
        "Đồ phòng tắm": "fa fa-soap",
        "Phòng tắm - Vòi sen": "fa fa-bath",
        "Điện thoại": "fa fa-phone",
        // Thêm các tiện nghi khác với icon tương ứng
      };
      return icons[amenity] || "fa fa-check"; // Mặc định trả về icon check nếu không có icon tương ứng
    },
    async fetchHotelDetails() {
      try {
        const hotelId = this.$route.params.id; // Lấy ID từ route params
        const response = await axiosClient.get(
          `/hotels/getHotelById/${hotelId}`
        );
        console.log("Dữ liệu khách sạn:", response.data);
        this.hotel = response.data.data; // Cập nhật dữ liệu khách sạn
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách sạn:", error);
      }
    },

    async fetchRooms() {
      try {
        const hotelId = this.$route.params.id;
        const response = await axiosClient.get(`/rooms/getRooms/${hotelId}`);

        // Kiểm tra nếu dữ liệu trả về là một mảng
        if (Array.isArray(response.data.data)) {
          this.roomList = response.data.data; // Đổi thành roomList
          console.log("Danh sách phòng với IS_IN_CART:", this.roomList);
        } else {
          console.error("Dữ liệu phòng không hợp lệ:", response.data.data);
          this.roomList = []; // Gán roomList là mảng rỗng nếu dữ liệu không hợp lệ
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng:", error);
        this.roomList = []; // Gán roomList là mảng rỗng nếu có lỗi
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

    openModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    // Mở modal lịch
    openCalendarModal() {
      this.isCalendarModalVisible = true;
      this.currentDate = new Date(); // Đặt lại currentDate về ngày hiện tại

      // Mặc định chọn ngày hiện tại và 3 ngày sau
      const today = new Date();
      this.selectedStartDate = today;
      const defaultEndDate = new Date();
      defaultEndDate.setDate(today.getDate() + 2); // Mặc định 3 ngày 2 đêm
      this.selectedEndDate = defaultEndDate;
    },

    // Đóng modal lịch
    closeCalendarModal() {
      this.isCalendarModalVisible = false;
    },

    disablePastDates(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    },

    // Kiểm tra ngày được chọn
    isSelectedDate(date) {
      if (!date) return false;

      // Lấy giá trị ngày giờ về 0 để so sánh chính xác
      const selectedStart = this.selectedStartDate
        ? new Date(
            this.selectedStartDate.getFullYear(),
            this.selectedStartDate.getMonth(),
            this.selectedStartDate.getDate()
          ).getTime()
        : null;

      const selectedEnd = this.selectedEndDate
        ? new Date(
            this.selectedEndDate.getFullYear(),
            this.selectedEndDate.getMonth(),
            this.selectedEndDate.getDate()
          ).getTime()
        : null;

      const currentDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ).getTime();

      // Kiểm tra nếu chỉ có ngày bắt đầu được chọn, tô màu ngày đó
      if (selectedStart && !selectedEnd) {
        return currentDate === selectedStart;
      }

      // Kiểm tra nếu cả hai ngày được chọn, tô màu khoảng thời gian
      if (selectedStart && selectedEnd) {
        return currentDate >= selectedStart && currentDate <= selectedEnd;
      }

      return false;
    },

    // Chọn ngày
    selectDate(day) {
      if (day.isPast || !day.date) {
        return; // Không cho chọn ngày trong quá khứ hoặc ô trống
      }

      if (!this.selectedStartDate || this.selectedEndDate) {
        // Nếu chưa chọn ngày bắt đầu hoặc đã chọn cả hai ngày, bắt đầu lại
        this.selectedStartDate = day.date;
        this.selectedEndDate = null;
      } else {
        if (day.date >= this.selectedStartDate) {
          this.selectedEndDate = day.date;
        } else {
          this.selectedStartDate = day.date;
          this.selectedEndDate = null;
        }
      }
    },
    bookNow(startDate, endDate) {
      // Kiểm tra trạng thái đăng nhập
      if (!this.isLoggedIn) {
        this.$toast.warning("Vui lòng đăng nhập để đặt phòng.", {
          position: "top-right",
          duration: 3000,
        });
        return;
      }

      this.$router.push({
        name: "BookingPage",
        query: {
          hotelId: this.hotel._id,
          startDate: startDate, // Dùng startDate truyền vào
          endDate: endDate, // Dùng endDate truyền vào
          roomId: this.selectedRoom._id,
        },
      });
    },

    // confirmDates() {
    //   if (!this.selectedStartDate || !this.selectedEndDate) {
    //     this.$toast.warning("Vui lòng chọn ngày bắt đầu và kết thúc.", {
    //       position: "top-right",
    //       duration: 3000,
    //     });
    //     return;
    //   }

    //   // Kiểm tra nếu ngày bắt đầu và ngày kết thúc là cùng một ngày
    //   if (this.selectedStartDate.getTime() === this.selectedEndDate.getTime()) {
    //     this.$toast.warning(
    //       "Ngày nhận và ngày trả phòng không được trùng nhau.",
    //       {
    //         position: "top-right",
    //         duration: 3000,
    //       }
    //     );

    //     return;
    //   }

    //   // Chuyển đổi ngày thành chuỗi để gửi lên server hoặc sử dụng
    //   const startDate = this.selectedStartDate.toISOString().split("T")[0];
    //   const endDate = this.selectedEndDate.toISOString().split("T")[0];

    //   console.log("Chuyển đến BookingPage với hotelId:", this.hotel._id);
    //   console.log("Ngày nhận phòng:", startDate, "Ngày trả phòng:", endDate);

    //   if (this.currentAction === "addToCart") {
    //     this.addToCart(this.selectedRoom, startDate, endDate);
    //   } else if (this.currentAction === "book") {
    //     // Ưu tiên điều hướng đến BookingPage khi currentAction là "book"
    //     console.log("Đang thực hiện điều hướng đến trang BookingPage");
    //     this.$router
    //       .push({
    //         name: "BookingPage",
    //         query: {
    //           hotelId: this.hotel._id,
    //           startDate,
    //           endDate,
    //         },
    //       })
    //       .catch((err) => {
    //         console.error("Lỗi khi chuyển hướng:", err);
    //       });
    //   } else if (this.currentAction === "bookNow") {
    //     this.$store.dispatch("setBookingDetails", {
    //       hotel: this.hotel,
    //       room: this.selectedRoom,
    //       startDate,
    //       endDate,
    //       totalPrice: this.selectedRoom.PRICE_PERNIGHT * this.nightsCount, // Tính tổng giá
    //     });

    //     // Điều hướng đến trang PaymentPage
    //     console.log("Điều hướng đến PaymentPage với thông tin phòng đã chọn")
    //     this.$router.push({
    //       name: "PaymentPage",
    //     });
    //   }
    //   // Đóng modal
    //   this.closeCalendarModal();
    // },

    confirmDates() {
      if (!this.selectedStartDate || !this.selectedEndDate) {
        this.$toast.warning("Vui lòng chọn ngày bắt đầu và kết thúc.", {
          position: "top-right",
          duration: 3000,
        });
        return;
      }

      // Kiểm tra nếu ngày nhận và ngày trả là cùng một ngày
      if (this.selectedStartDate.getTime() === this.selectedEndDate.getTime()) {
        this.$toast.warning(
          "Ngày nhận và ngày trả phòng không được trùng nhau.",
          {
            position: "top-right",
            duration: 3000,
          }
        );
        return;
      }

      // Chuyển đổi ngày thành chuỗi định dạng YYYY-MM-DD
      const startDate = this.selectedStartDate.toISOString().split("T")[0];
      const endDate = this.selectedEndDate.toISOString().split("T")[0];

      console.log("Chuyển đến BookingPage với hotelId:", this.hotel._id);
      console.log("Ngày nhận phòng:", startDate, "Ngày trả phòng:", endDate);

      switch (this.currentAction) {
        case "addToCart":
          // Thêm phòng vào giỏ hàng
          this.addToCart(this.selectedRoom, startDate, endDate);
          break;

        case "book":
          // Điều hướng đến BookingPage với các query params
          console.log("Đang thực hiện điều hướng đến trang BookingPage");
          this.$router
            .push({
              name: "BookingPage",
              query: {
                hotelId: this.hotel._id,
                startDate,
                endDate,
              },
            })
            .catch((err) => {
              console.error("Lỗi khi chuyển hướng:", err);
            });
          break;

        case "bookNow":
          if (this.selectedRoom) {
            this.$store.commit("SET_BOOKING_DETAIL", {
              hotel: this.hotel,
              room: this.selectedRoom,
              startDate,
              endDate,
              totalPrice: this.selectedRoom.PRICE_PERNIGHT * this.nightsCount, // Tính tổng giá dựa trên số đêm
            });

            console.log("Booking details:", {
              hotel: this.hotel,
              room: this.selectedRoom,
              startDate,
              endDate,
              totalPrice: this.selectedRoom.PRICE_PERNIGHT * this.nightsCount,
            });

            console.log(
              "Điều hướng đến PaymentPage với thông tin phòng đã chọn"
            );
            this.$router.push({
              name: "PaymentPage",
            });
          }

          break;

        default:
          console.error("Hành động không xác định:", this.currentAction);
      }

      // Đóng modal sau khi hoàn tất
      this.closeCalendarModal();
    },

    // Định dạng ngày
    formatDate(date) {
      if (!date) return "";
      return date.toLocaleDateString("vi-VN");
    },
  },
  computed: {
    nightsCount() {
      if (this.selectedStartDate && this.selectedEndDate) {
        const start = new Date(
          this.selectedStartDate.getFullYear(),
          this.selectedStartDate.getMonth(),
          this.selectedStartDate.getDate()
        );
        const end = new Date(
          this.selectedEndDate.getFullYear(),
          this.selectedEndDate.getMonth(),
          this.selectedEndDate.getDate()
        );
        const diffTime = end - start;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      }
      return 0;
    },
    isPrevMonthDisabled() {
      const today = new Date();
      const prevMonthDate = new Date(this.currentDate);
      prevMonthDate.setMonth(this.currentDate.getMonth() - 1);

      return (
        prevMonthDate.getFullYear() < today.getFullYear() ||
        (prevMonthDate.getFullYear() === today.getFullYear() &&
          prevMonthDate.getMonth() < today.getMonth())
      );
    },
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    calendar() {
      const days = [];
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const startDayOfWeek = new Date(year, month, 1).getDay(); // Ngày bắt đầu của tháng

      let week = [];
      // Thêm các ô trống cho các ngày trước ngày 1 của tháng
      for (let i = 0; i < startDayOfWeek; i++) {
        week.push({ label: "", date: null, isPast: false });
      }

      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const today = new Date();
        const isPast =
          date < today.setHours(0, 0, 0, 0) &&
          month === today.getMonth() &&
          year === today.getFullYear();

        week.push({
          label: day,
          date: date,
          isPast: isPast,
        });

        if (week.length === 7) {
          days.push(week);
          week = [];
        }
      }

      // Thêm các ô trống cho các ngày sau ngày cuối cùng của tháng
      if (week.length > 0) {
        while (week.length < 7) {
          week.push({ label: "", date: null, isPast: false });
        }
        days.push(week);
      }

      return days;
    },
    groupedRooms() {
      if (!Array.isArray(this.roomList) || this.roomList.length === 0) {
        return {};
      }

      return this.roomList.reduce((acc, room) => {
        if (!acc[room.TYPE]) {
          acc[room.TYPE] = {
            roomNumbers: [],
            bedTypeGroups: {},
          };
        }

        acc[room.TYPE].roomNumbers.push(room.ROOM_NUMBER);

        const bedType = room.CUSTOM_ATTRIBUTES.bedType || "Unknown BedType";
        if (!acc[room.TYPE].bedTypeGroups[bedType]) {
          acc[room.TYPE].bedTypeGroups[bedType] = [];
        }

        // acc[room.TYPE].bedTypeGroups[bedType].push(room);
        acc[room.TYPE].bedTypeGroups[bedType].push({
          ...room,
          IS_IN_CART: room.IS_IN_CART, // Lấy giá trị IS_IN_CART
        });

        return acc;
      }, {});
    },
    // Tính toán tháng hiện tại và định dạng
    formattedCurrentMonth() {
      return this.currentDate.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
      });
    },
    // Tạo các ngày trong tháng
    daysInMonth() {
      const days = [];
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let i = 1; i <= totalDays; i++) {
        days.push({
          label: i,
          date: new Date(year, month, i),
        });
      }
      return days;
    },
  },
};
</script>

<style scoped>
@import "./HotelDetail.scss";
</style>
