<template>
  <div class="cart-container">
    <div v-if="hotels.length > 0">
      <h3>Giỏ hàng của bạn</h3>
      <table class="custom-table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Loại</th>
            <th>Giá/Đêm</th>
            <th>Thời gian</th>
            <th>Số phòng</th>
            <th>Số người</th>
            <th>Tổng giá</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(hotel, index) in hotels" :key="index">
            <tr class="hotel-name-row">
              <td>
                <input
                  type="checkbox"
                  v-model="hotel.isSelected"
                  @change="toggleHotelRooms(hotel)"
                  class="custom-checkbox"
                />
              </td>
              <td
                colspan="8"
                class="hotel-name"
                @click="goToHotelDetail(hotel)"
              >
                <i class="fa fa-hotel"></i> {{ hotel.HOTEL_NAME }}
              </td>
            </tr>

            <tr v-for="(room, roomIndex) in hotel.ROOMS" :key="roomIndex">
              <td>
                <input
                  type="checkbox"
                  v-model="room.isSelected"
                  @change="toggleRoom(room)"
                  class="custom-checkbox"
                />
              </td>
              <td class="image-column">
                <img
                  v-if="room.imageUrl"
                  :src="room.imageUrl"
                  alt="Room Image"
                  class="room-image"
                />
              </td>
              <td>{{ room.TYPE }}</td>
              <td>{{ room.PRICE_PERNIGHT?.toLocaleString() }} VND</td>
              <td>
                <p>
                  {{ formatDate(room.START_DATE) }} -
                  {{ formatDate(room.END_DATE) }}
                </p>
                <p>
                  {{ calculateStayDuration(room.START_DATE, room.END_DATE) }}
                </p>
              </td>
              <td>
                <div class="room-number-box">
                  {{ room.ROOM_NUMBER }}
                </div>
              </td>
              <td>
                <span>{{ room.CUSTOM_ATTRIBUTES?.number_of_people }}</span>
              </td>
              <td>{{ room.TOTAL_PRICE_FOR_ROOM?.toLocaleString() }} VND</td>
              <td>
                <button class="edit-btn" @click="showUpdateModal(room)">
                  Chỉnh sửa
                </button>
                <button class="delete-btn" @click="removeRoom(room.ROOM_ID)">
                  Xóa
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
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
                      disabled: day.isPast || !day.isAvailable,
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
          <button class="confirm-button" @click="confirmUpdateRoom">
            Xác nhận
          </button>
        </div>
      </div>

      <div v-if="totalRooms > 0" class="floating-modal">
        <div class="modal-content">
          <div class="modal-info">
            <span>Tổng số lượng phòng: {{ totalRooms }}</span>
            <span>Tổng giá: {{ totalPrice.toLocaleString() }} VND</span>
          </div>
          <div class="booking">
            <button class="checkout-btn" @click="checkout">Đặt phòng</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-cart-container">
      <p><i class="fas fa-shopping-cart"></i> Giỏ hàng của bạn đang trống.</p>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      hotels: [], // Dữ liệu khách sạn sẽ được lưu vào đây
      showModal: false, // Hiển thị modal chỉnh sửa
      selectedRoom: {
        // Dữ liệu phòng được chọn để chỉnh sửa
        roomId: "",
        newStartDate: "",
        newEndDate: "",
      },
      totalRooms: 0,
      totalPrice: 0,
      footerOffsetTop: 0, // Vị trí trên của footer
      lastRoomOffsetTop: 0, // Vị trí trên của phòng cuối cùng trong giỏ hàng
      floatingModalHeight: 0, // Chiều cao của modal nổi
      gapSpace: 150,
      availableRooms: [],
      isCalendarModalVisible: false, // Trạng thái hiển thị modal lịch
      selectedStartDate: null,
      selectedEndDate: null,
      currentDate: new Date(),
      currentAction: "",
    };
  },
  async created() {
    await this.fetchCartData();
    this.updateOffsets(); // Cập nhật vị trí của footer và phần tử cuối
    window.addEventListener("scroll", this.handleScroll); // Theo dõi sự kiện cuộn
    window.addEventListener("resize", this.updateOffsets); // Cập nhật khi thay đổi kích thước cửa sổ
  },

  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.updateOffsets);
  },

  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    },
    footerOffsetTop() {
      return this.$store.state.footerOffsetTop; // Lấy giá trị từ Vuex
    },
    hasRoomsInCart() {
      // Kiểm tra xem có bất kỳ khách sạn nào có phòng hay không
      return this.hotels.some((hotel) => hotel.ROOMS && hotel.ROOMS.length > 0);
    },
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
    calendar() {
      const days = [];
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const startDayOfWeek = new Date(year, month, 1).getDay(); // Ngày bắt đầu của tháng

      let week = [];
      // Thêm các ô trống cho các ngày trước ngày 1 của tháng
      for (let i = 0; i < startDayOfWeek; i++) {
        week.push({ label: "", date: null, isPast: false, isAvailable: false });
      }

      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian của ngày hôm nay về 0 giờ để so sánh
        const isPast = date < today;

        // Kiểm tra tính khả dụng của ngày
        const isAvailable =
          Array.isArray(this.selectedRoom?.AVAILABILITY) &&
          this.selectedRoom.AVAILABILITY.some(
            (availability) =>
              new Date(availability.DATE).toDateString() ===
                date.toDateString() && availability.AVAILABLE
          );

        week.push({
          label: day,
          date: date,
          isPast: isPast,
          isAvailable: isAvailable !== false,
        });

        if (week.length === 7) {
          days.push(week);
          week = [];
        }
      }

      // Thêm các ô trống cho các ngày sau ngày cuối cùng của tháng
      if (week.length > 0) {
        while (week.length < 7) {
          week.push({
            label: "",
            date: null,
            isPast: false,
            isAvailable: false,
          });
        }
        days.push(week);
      }

      return days;
    },
  },
  methods: {
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

    formatDateForAPI(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    openCalendarModalForRoom(room, action) {
      if (!this.isLoggedIn) {
        this.$router.push({
          name: "Login", // Tên của route đăng nhập
          query: { redirect: this.$route.fullPath }, // Lưu trang hiện tại để chuyển lại sau khi đăng nhập
        });
        return;
      }
      this.selectedRoom = room;
      console.log("dữ liệu phòng: ", this.selectedRoom);
      this.currentAction = action; // Lưu hành động hiện tại
      this.openCalendarModal(); // Mở modal lịch
    },

    openCalendarModal() {
      this.isCalendarModalVisible = true;
      this.currentDate = new Date(); // Đặt lại currentDate về ngày hiện tại

      // Sử dụng newStartDate và newEndDate nếu chúng tồn tại
      if (this.selectedRoom.newStartDate && this.selectedRoom.newEndDate) {
        this.selectedStartDate = new Date(this.selectedRoom.newStartDate);
        this.selectedEndDate = new Date(this.selectedRoom.newEndDate);
      } else if (this.selectedRoom.startDate && this.selectedRoom.endDate) {
        // Hoặc sử dụng startDate và endDate nếu có
        this.selectedStartDate = new Date(this.selectedRoom.startDate);
        this.selectedEndDate = new Date(this.selectedRoom.endDate);
      } else {
        // Nếu không có, mặc định ngày hiện tại và 2 ngày sau
        const today = new Date();
        const startDate = new Date(today.getTime());
        const endDate = new Date(today.getTime());
        endDate.setDate(endDate.getDate() + 2);
        this.selectedStartDate = startDate;
        this.selectedEndDate = endDate;
      }
    },

    findAvailableDates(startDate, endDate) {
      let availableStart = new Date(startDate.getTime()); // Sao chép startDate
      let availableEnd = new Date(endDate.getTime()); // Sao chép endDate

      // Lặp qua các ngày để kiểm tra ngày nào khả dụng
      while (!this.isDateRangeAvailable(availableStart, availableEnd)) {
        availableStart.setDate(availableStart.getDate() + 1); // Kiểm tra ngày tiếp theo
        availableEnd = new Date(availableStart.getTime()); // Tạo đối tượng mới cho availableEnd
        availableEnd.setDate(availableStart.getDate() + 2); // Tính lại ngày kết thúc sau 3 ngày
      }

      return { newStartDate: availableStart, newEndDate: availableEnd };
    },

    isDateRangeAvailable(startDate, endDate) {
      // Danh sách các ngày không khả dụng của phòng từ AVAILABILITY
      const unavailableDates = this.getUnavailableDates();

      // Kiểm tra từng ngày trong khoảng từ startDate đến endDate
      for (
        let d = new Date(startDate.getTime());
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0]; // Chuyển ngày thành chuỗi để so sánh
        if (unavailableDates.includes(dateStr)) {
          return false; // Nếu một ngày nào đó không khả dụng, trả về false
        }
      }

      return true; // Nếu tất cả các ngày trong khoảng đều khả dụng, trả về true
    },

    getUnavailableDates() {
      if (
        !this.selectedRoom ||
        !Array.isArray(this.selectedRoom.AVAILABILITY)
      ) {
        return []; // Nếu không có AVAILABILITY, trả về mảng trống
      }

      return this.selectedRoom.AVAILABILITY.filter(
        (availability) => !availability.AVAILABLE // Chỉ giữ các ngày không khả dụng
      ).map((availability) => {
        const date = new Date(availability.DATE);
        return date.toISOString().split("T")[0]; // Trả về chuỗi ngày dạng YYYY-MM-DD
      });
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

    selectDate(day) {
      if (day.isPast || !day.date || !day.isAvailable) {
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

    // Kiểm tra ngày bắt đầu
    validateStartDate() {
      if (this.getUnavailableDates().includes(this.selectedRoom.newStartDate)) {
        Swal.fire({
          title: "Ngày đã được đặt!",
          text: "Vui lòng chọn ngày khác cho ngày bắt đầu.",
          icon: "error",
          confirmButtonText: "OK",
        });
        this.selectedRoom.newStartDate = ""; // Xóa ngày không hợp lệ
      }
    },

    // Kiểm tra ngày kết thúc
    validateEndDate() {
      if (this.getUnavailableDates().includes(this.selectedRoom.newEndDate)) {
        Swal.fire({
          title: "Ngày đã được đặt!",
          text: "Vui lòng chọn ngày khác cho ngày kết thúc.",
          icon: "error",
          confirmButtonText: "OK",
        });
        this.selectedRoom.newEndDate = ""; // Xóa ngày không hợp lệ
      }
    },

    getTodayDate() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
      const year = today.getFullYear();
      return `${year}-${month}-${day}`;
    },

    // Hàm trả về ngày kế tiếp của một ngày
    getNextDay(date) {
      if (!date) return this.getTodayDate(); // Nếu chưa chọn ngày nhận, trả về ngày hiện tại
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1); // Cộng thêm 1 ngày vào ngày đã chọn
      const day = String(nextDay.getDate()).padStart(2, "0");
      const month = String(nextDay.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
      const year = nextDay.getFullYear();
      return `${year}-${month}-${day}`; // Trả về ngày kế tiếp theo định dạng yyyy-mm-dd
    },

    // Kiểm tra ngày có được đặt (AVAILABLE là false) hay không
    isDateUnavailable(date) {
      return this.selectedRoom.AVAILABILITY.some(
        (availability) =>
          availability.date === date && availability.AVAILABLE === false
      );
    },

    // Hàm kiểm tra ngày đã chọn có hợp lệ không
    isValidDateRange(startDate, endDate) {
      // Kiểm tra ngày bắt đầu hoặc kết thúc có phải là ngày đã được đặt hay không
      if (
        this.isDateUnavailable(startDate) ||
        this.isDateUnavailable(endDate)
      ) {
        Swal.fire({
          title: "Lỗi",
          text: "Ngày bạn chọn đã được đặt. Vui lòng chọn ngày khác.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return false;
      }
      return true;
    },

    async confirmUpdateRoom() {
      // Kiểm tra nếu ngày hợp lệ thì mới cập nhật
      if (!this.selectedStartDate || !this.selectedEndDate) {
        Swal.fire({
          title: "Lỗi",
          text: "Vui lòng chọn ngày bắt đầu và kết thúc.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "swal2-custom-popup",
          },
        });
        return;
      }

      // Cập nhật ngày mới vào selectedRoom
      this.selectedRoom.newStartDate = this.selectedStartDate
        .toISOString()
        .split("T")[0];
      this.selectedRoom.newEndDate = this.selectedEndDate
        .toISOString()
        .split("T")[0];

      // Tiếp tục quy trình cập nhật phòng
      // Gọi API để cập nhật thông tin phòng
      try {
        const result = await Swal.fire({
          title: "Bạn chắc chắn muốn cập nhật thông tin phòng này không?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#28a745",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Cập nhật",
          cancelButtonText: "Hủy",
          customClass: {
            popup: "swal2-custom-popup",
          },
        });

        if (result.isConfirmed) {
          await this.updateRoom(); // Gọi phương thức cập nhật phòng
        }
      } catch (error) {
        console.error("Error confirming update:", error);
        Swal.fire({
          title: "Lỗi!",
          text: "Có lỗi xảy ra khi xác nhận cập nhật.",
          icon: "error",
          customClass: {
            popup: "swal2-custom-popup",
          },
        });
      }
    },

    increasePeople(room) {
      if (room.people < room.CUSTOM_ATTRIBUTES.number_of_people) {
        room.people += 1;
        this.calculateTotal(); // Cập nhật tổng sau khi thay đổi
      }
    },

    decreasePeople(room) {
      if (room.people > 1) {
        room.people -= 1;
        this.calculateTotal(); // Cập nhật tổng sau khi thay đổi
      }
    },
    // Tính toán vị trí footer và phần tử cuối cùng trong giỏ hàng
    updateOffsets() {
      const footer = document.querySelector("footer"); // Tìm footer từ DOM toàn cục
      const lastRoom = document.querySelector(
        ".cart-container tbody tr:last-child"
      ); // Chọn phần tử cuối cùng trong giỏ hàng
      const floatingModal = document.querySelector(".floating-modal");

      if (footer) {
        this.footerOffsetTop = footer.offsetTop;
      }

      if (lastRoom) {
        this.lastRoomOffsetTop = lastRoom.offsetTop + lastRoom.clientHeight; // Vị trí của phòng cuối cùng trong giỏ hàng
      }

      if (floatingModal) {
        this.floatingModalHeight = floatingModal.clientHeight; // Chiều cao của modal nổi
      }
    },
    handleScroll() {
      const floatingModal = document.querySelector(".floating-modal");
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;

      if (!floatingModal) return;

      // Tính toán vị trí tối đa mà modal có thể "dừng lại"
      const maxStopPosition =
        this.footerOffsetTop - this.floatingModalHeight - this.gapSpace;

      if (scrollTop + windowHeight >= this.footerOffsetTop) {
        floatingModal.classList.add("sticky");
        floatingModal.style.position = "absolute";
        floatingModal.style.top = `${maxStopPosition}px`;
        floatingModal.style.bottom = "auto";
      } else if (
        scrollTop + windowHeight >=
        this.lastRoomOffsetTop + this.floatingModalHeight
      ) {
        // Khi modal nằm giữa footer và phần tử cuối cùng
        floatingModal.classList.add("sticky");
        floatingModal.style.position = "fixed";
        floatingModal.style.bottom = "0px";
        floatingModal.style.top = "auto";
      } else {
        // Khi modal không chạm tới footer hoặc phần tử cuối cùng
        floatingModal.classList.remove("sticky");
        floatingModal.style.position = "fixed";
        floatingModal.style.bottom = "0px";
        floatingModal.style.top = "auto";
      }
    },

    getSelectedRooms() {
      const selectedRooms = [];

      this.hotels.forEach((hotel) => {
        hotel.ROOMS.forEach((room) => {
          if (room.isSelected) {
            selectedRooms.push({
              roomId: room.ROOM_ID,
              hotelId: hotel.HOTEL_ID,
              startDate: room.START_DATE,
              endDate: room.END_DATE,
              pricePerNight: room.PRICE_PERNIGHT,
              totalPrice: room.TOTAL_PRICE_FOR_ROOM,
              roomNumber: room.ROOM_NUMBER,
              hotelName: hotel.HOTEL_NAME,
              TYPE: room.TYPE,
              bedType: room.CUSTOM_ATTRIBUTES?.bedType,
              number_of_people: room.CUSTOM_ATTRIBUTES?.number_of_people,
            });
          }
        });
      });

      console.log("Selected Rooms after mapping:", selectedRooms);
      return selectedRooms;
    },

    async checkout() {
      const selectedRooms = this.getSelectedRooms();
      console.log("Rooms data sent to PaymentPage:", selectedRooms); // Kiểm tra dữ liệu

      this.$store.commit("SET_SELECTEDROOMS_CART", selectedRooms);

      this.$router.push({ name: "PaymentPage" });
    },

    async fetchCartData() {
      try {
        const response = await axiosClient.post("/carts/getCartByUserId");
        console.log("Cart Data:", response.data);

        if (response.data.cart && Array.isArray(response.data.cart.HOTELS)) {
          this.hotels = response.data.cart.HOTELS.map((hotel) => ({
            HOTEL_NAME: hotel.HOTEL_NAME,
            HOTEL_ID: hotel.HOTEL_ID,
            ROOMS: Array.isArray(hotel.ROOMS)
              ? hotel.ROOMS.filter(
                  (room) => room.TOTAL_PRICE_FOR_ROOM !== null
                ).map((room) => ({
                  ROOM_ID: room.ROOM_ID,
                  HOTEL_ID: room.HOTEL_ID,
                  START_DATE: room.START_DATE,
                  END_DATE: room.END_DATE,
                  PRICE_PERNIGHT: room.PRICE_PERNIGHT,
                  TOTAL_PRICE_FOR_ROOM: room.TOTAL_PRICE_FOR_ROOM,
                  ROOM_NUMBER: room.ROOM_NUMBER,
                  TYPE: room.TYPE,
                  CUSTOM_ATTRIBUTES: room.CUSTOM_ATTRIBUTES,
                  AVAILABILITY: room.AVAILABILITY,
                  imageUrl: room.IMAGES && room.IMAGES[0],
                  isSelected: false, // Thêm thuộc tính isSelected
                }))
              : [],
          })).filter((hotel) => hotel.ROOMS.length > 0);
        } else {
          this.hotels = [];
          console.log("Giỏ hàng trống.");
        }

        this.calculateTotal();
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    },

    calculateTotal() {
      let totalRooms = 0;
      let totalPrice = 0;

      this.hotels.forEach((hotel) => {
        hotel.ROOMS.forEach((room) => {
          if (room.isSelected) {
            totalRooms += 1;

            const roomTotalPrice = Number(room.TOTAL_PRICE_FOR_ROOM);
            if (!isNaN(roomTotalPrice)) {
              totalPrice += roomTotalPrice;
            } else {
              console.warn(
                `Giá trị TOTAL_PRICE_FOR_ROOM của phòng ${room.ROOM_ID} không hợp lệ:`,
                room.TOTAL_PRICE_FOR_ROOM
              );
            }
          }
        });
      });

      this.totalRooms = totalRooms;
      this.totalPrice = totalPrice;
    },

    toggleHotelRooms(hotel) {
      hotel.ROOMS.forEach((room) => {
        room.isSelected = hotel.isSelected;
      });
      this.calculateTotal(); // Cập nhật tổng sau khi chọn
    },

    // Phương thức chọn/bỏ chọn phòng
    toggleRoom(room) {
      this.calculateTotal(); // Cập nhật tổng sau khi chọn
    },

    goToHotelDetail(hotel) {
      // Điều hướng đến trang chi tiết của khách sạn dựa trên ID hoặc slug
      this.$router.push({
        name: "HotelDetail",
        params: { id: hotel.HOTEL_ID },
      });
    },

    // Phương thức định dạng ngày tháng
    formatDate(date) {
      const formattedDate = new Date(date);
      const day = String(formattedDate.getDate()).padStart(2, "0"); // Lấy ngày và thêm số 0 nếu cần
      const month = String(formattedDate.getMonth() + 1).padStart(2, "0"); // Lấy tháng và thêm số 0 nếu cần (tháng bắt đầu từ 0)
      const year = formattedDate.getFullYear(); // Lấy năm

      return `${day}/${month}/${year}`; // Trả về chuỗi theo định dạng dd/MM/yyyy
    },

    // Phương thức tính thời gian ở (ví dụ: "3 ngày 2 đêm")
    calculateStayDuration(startDate, endDate) {
      if (!startDate || !endDate) {
        return "0 ngày 0 đêm";
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.floor((end - start) / (1000 * 60 * 60 * 24)); // Tính số ngày ở
      const days = duration + 1; // Số ngày = khoảng cách giữa 2 ngày + 1
      const nights = duration; // Số đêm = khoảng cách giữa 2 ngày
      return `${days} ngày ${nights} đêm`;
    },

    async removeRoom(roomId) {
      try {
        const result = await Swal.fire({
          title: "Bạn chắc chắn muốn xóa phòng này không?",
          text: "Hành động này không thể hoàn tác!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#e74c3c",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
          await axiosClient.post("/carts/removeRoomFromCart", { roomId });
          await this.fetchCartData();
          this.$store.dispatch("fetchCart");
          Swal.fire("Đã xóa!", "Phòng đã được xóa khỏi giỏ hàng.", "success");
        }
      } catch (error) {
        console.error("Error removing room:", error);
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa phòng.", "error");
      }
    },

    // Phương thức đặt phòng
    async bookRoom(room) {
      console.log(`Booking room with ID: ${room.ROOM_ID}`);
      // Thêm logic đặt phòng ở đây
    },

    // Phương thức hiển thị modal chỉnh sửa
    showUpdateModal(room) {
      // Sao chép toàn bộ đối tượng phòng
      this.selectedRoom = { ...room };
      // Thêm thuộc tính newStartDate và newEndDate nếu cần
      const startDate = new Date(room.START_DATE);
      const endDate = new Date(room.END_DATE);
      // Định dạng ngày theo múi giờ địa phương
      this.selectedRoom.newStartDate = this.formatDateForAPI(startDate);
      this.selectedRoom.newEndDate = this.formatDateForAPI(endDate);
      this.openCalendarModal(); // Mở modal lịch
    },

    // Phương thức đóng modal
    closeModal() {
      this.showModal = false;
    },

    // async confirmUpdateRoom() {
    //   try {
    //     const result = await Swal.fire({
    //       title: "Bạn chắc chắn muốn cập nhật thông tin phòng này không?",
    //       icon: "question",
    //       showCancelButton: true,
    //       confirmButtonColor: "#28a745",
    //       cancelButtonColor: "#6c757d",
    //       confirmButtonText: "Cập nhật",
    //       cancelButtonText: "Hủy",
    //     });

    //     if (result.isConfirmed) {
    //       this.updateRoom(); // Gọi phương thức cập nhật phòng
    //     }
    //   } catch (error) {
    //     console.error("Error confirming update:", error);
    //     Swal.fire("Lỗi!", "Có lỗi xảy ra khi xác nhận cập nhật.", "error");
    //   }
    // },

    // Phương thức cập nhật thông tin phòng
    async updateRoom() {
      try {
        await axiosClient.post("/carts/updateRoomInCart", {
          roomId: this.selectedRoom.ROOM_ID, // Thay đổi ở đây
          newStartDate: this.formatDateForAPI(this.selectedStartDate),
          newEndDate: this.formatDateForAPI(this.selectedEndDate),
        });

        await this.fetchCartData();
        this.closeCalendarModal();
        Swal.fire({
          title: "Thành công!",
          text: "Thông tin phòng đã được cập nhật.",
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
          },
        });
      } catch (error) {
        console.error("Error updating room:", error);
        Swal.fire({
          title: "Lỗi!",
          text: "Có lỗi xảy ra khi cập nhật phòng.",
          icon: "error",
          customClass: {
            popup: "swal2-custom-popup",
          },
        });
      }
    },
  },
};
</script>

<style scoped>
@import "./CartPage.scss";
</style>
