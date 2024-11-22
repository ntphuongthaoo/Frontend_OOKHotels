<template>
  <div class="booking-management-container">
    <!-- Tiêu đề -->
    <!-- <h1>Quản Lý Đặt Phòng</h1> -->

    <!-- Phần tìm kiếm và lọc -->
    <div class="filter-section">
      <input
        type="text"
        v-model="searchKeyword"
        placeholder="Tìm kiếm theo tên hoặc số điện thoại"
        @input="handleSearch"
      />
      <select v-model="selectedStatus" @change="handleFilter">
        <option value="">Tất cả trạng thái</option>
        <option value="NotYetPaid">Chưa thanh toán</option>
        <option value="Booked">Đã đặt</option>
        <option value="CheckedIn">Đã nhận phòng</option>
        <option value="CheckedOut">Đã trả phòng</option>
        <option value="Canceled">Đã hủy</option>
      </select>

      <!-- Thanh lọc khách sạn -->
      <select
        v-model="selectedHotelId"
        @change="handleFilter"
        :disabled="!isAdmin && !!userHotelId"
      >
        <option value="">Tất cả khách sạn</option>
        <option v-for="hotel in hotels" :key="hotel._id" :value="hotel._id">
          {{ hotel.NAME }}
        </option>
      </select>
    </div>

    <!-- Bảng danh sách đặt phòng -->
    <table class="booking-table">
      <thead>
        <tr>
          <th>Tên khách hàng</th>
          <th>Số điện thoại</th>
          <th>Tổng tiền (VND)</th>
          <th>Ngày đặt</th>
          <th>Trạng thái</th>
          <th>Khách sạn</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in filteredBookings" :key="booking._id">
          <td>{{ booking.CUSTOMER_NAME }}</td>
          <td>{{ booking.CUSTOMER_PHONE }}</td>
          <td>{{ formatCurrency(booking.TOTAL_PRICE) }}</td>
          <td>{{ formatDate(booking.createdAt) }}</td>
          <td :class="getStatusClass(booking.STATUS)">
            {{ getStatusLabel(booking.STATUS) }}
          </td>
          <td v-if="booking.LIST_ROOMS.length > 0">
            {{ extractHotelName(booking.LIST_ROOMS[0].ROOM_ID.HOTEL_ID.NAME) }}
          </td>
          <td>
            <button @click="viewBookingDetails(booking)">Xem chi tiết</button>
            <button @click="toggleStatusModal(booking)">
              Cập nhật trạng thái
            </button>
          </td>

          <div v-if="isUpdateModalOpen" class="status-modal-overlay">
            <div class="status-modal-content">
              <h2>Cập Nhật Trạng Thái Đặt Phòng</h2>
              <select v-model="newStatus" class="status-select">
                <option value="CheckedIn">Đã nhận phòng</option>
                <option value="CheckedOut">Đã trả phòng</option>
                <option value="Canceled">Đã hủy</option>
              </select>
              <div class="modal-footer">
                <button
                  class="update-button"
                  @click="updateBookingStatus(selectedBooking)"
                >
                  Xác nhận
                </button>
                <button class="close-button" @click="closeUpdateModal">
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </tr>
      </tbody>
    </table>

    <!-- Hiển thị thông báo khi không có đặt phòng nào -->
    <div v-if="filteredBookings.length === 0" class="no-bookings">
      <p>Không có đặt phòng nào để hiển thị.</p>
    </div>

    <!-- Phân trang -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Trước</button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages">
        Sau
      </button>
    </div>

    <div v-if="isDetailModalOpen" class="custom-modal-overlay">
      <div class="custom-modal-content">
        <h2>Chi Tiết Đặt Phòng</h2>
        <div v-if="selectedBooking">
          <div class="section">
            <h3>Thông Tin Khách Hàng</h3>
            <div class="info-group">
              <p><strong>Tên:</strong> {{ selectedBooking.CUSTOMER_NAME }}</p>
              <p>
                <strong>Số điện thoại:</strong>
                {{ selectedBooking.CUSTOMER_PHONE }}
              </p>
              <p>
                <strong>CCCD/CMND:</strong> {{ selectedBooking.CITIZEN_ID }}
              </p>
            </div>
          </div>

          <div class="section">
            <h3>Danh Sách Phòng</h3>
            <table class="room-table">
              <thead>
                <tr>
                  <th>Khách sạn</th>
                  <th>Số Phòng</th>
                  <th>Ngày Nhận</th>
                  <th>Ngày Trả</th>
                  <th>Tổng Tiền (VND)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="room in selectedBooking.LIST_ROOMS"
                  :key="room.ROOM_ID.ROOM_NUMBER"
                >
                  <td>{{ extractHotelName(room.ROOM_ID.HOTEL_ID.NAME) }}</td>
                  <td>{{ room.ROOM_ID.ROOM_NUMBER }}</td>
                  <td>{{ formatDate(room.START_DATE) }}</td>
                  <td>{{ formatDate(room.END_DATE) }}</td>
                  <td>{{ formatCurrency(room.TOTAL_PRICE_FOR_ROOM) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>Thông Tin Thanh Toán</h3>
            <div class="info-group">
              <p>
                <strong>Tổng Số Tiền:</strong>
                {{ formatCurrency(selectedBooking.TOTAL_PRICE) }}
              </p>
              <p>
                <strong>Trạng Thái:</strong>
                {{ getStatusLabel(selectedBooking.STATUS) }}
              </p>
              <p>
                <strong>Loại Đặt Phòng:</strong>
                {{ selectedBooking.BOOKING_TYPE }}
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="close-button" @click="closeDetailModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import axiosClient from "../../api/axiosClient";

export default {
  data() {
    return {
      bookings: [],
      hotels: [],
      searchKeyword: "",
      selectedStatus: "",
      selectedHotelId: "",
      isDetailModalOpen: false,
      selectedBooking: null,
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      isUpdateModalOpen: false,
      newStatus: "",
    };
  },
  computed: {
    filteredBookings() {
      return this.bookings.filter((booking) => {
        const matchesKeyword =
          booking.CUSTOMER_NAME.toLowerCase().includes(
            this.searchKeyword.toLowerCase()
          ) || booking.CUSTOMER_PHONE.includes(this.searchKeyword);
        const matchesStatus =
          this.selectedStatus === "" || booking.STATUS === this.selectedStatus;
        const matchesHotel =
          this.selectedHotelId === "" ||
          (booking.LIST_ROOMS &&
            booking.LIST_ROOMS.some(
              (room) => room.ROOM_ID.HOTEL_ID._id === this.selectedHotelId
            ));
        return matchesKeyword && matchesStatus && matchesHotel;
      });
    },
    isAdmin() {
      return this.$store.getters.isAdmin;
    },
    userHotelId() {
      return this.$store.getters.getHotelId;
    },
  },
  methods: {
    async fetchBookings() {
      try {
        let url = `/bookings/getAllBookings?page=${this.currentPage}&limit=${this.pageSize}`;

        // Thêm điều kiện lọc theo trạng thái
        if (this.selectedStatus) {
          url += `&status=${this.selectedStatus}`;
        }

        // Thêm điều kiện lọc theo khách sạn (chỉ nếu không phải admin)
        if (this.selectedHotelId) {
          url += `&hotelId=${this.selectedHotelId}`;
        } else if (!this.isAdmin && this.userHotelId) {
          this.selectedHotelId = this.userHotelId;
          url += `&hotelId=${this.userHotelId}`;
        }

        const response = await axiosClient.get(url);
        if (response.data.success) {
          this.bookings = response.data.bookings;
          this.totalPages = response.data.totalPages;
        } else {
          Swal.fire("Lỗi", "Không thể lấy danh sách đặt phòng.", "error");
        }
      } catch (error) {
        Swal.fire("Lỗi", "Không thể kết nối đến server.", "error");
      }
    },
    async fetchHotels() {
      try {
        const response = await axiosClient.get("/hotels/getAllHotels");
        this.hotels = response.data.data;

        // Nếu người dùng là nhân viên, đặt khách sạn mặc định
        if (!this.isAdmin && this.userHotelId) {
          this.selectedHotelId = this.userHotelId;
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    },
    toggleStatusModal(booking) {
      this.selectedBooking = booking;
      this.newStatus = booking.STATUS; // Lưu trạng thái hiện tại
      this.isUpdateModalOpen = true;
    },
    closeUpdateModal() {
      this.isUpdateModalOpen = false;
      this.selectedBooking = null;
    },
    async updateBookingStatus(booking) {
      if (!this.newStatus) return; // Nếu không chọn trạng thái, không làm gì
      try {
        const response = await axiosClient.put(
          `/bookings/updateStatus/${booking._id}`,
          { status: this.newStatus }
        );
        if (response.data.success) {
          Swal.fire("Thành công", "Trạng thái đã được cập nhật.", "success");
          this.fetchBookings();
        } else {
          Swal.fire("Lỗi", "Không thể cập nhật trạng thái.", "error");
        }
      } catch (error) {
        Swal.fire("Lỗi", "Không thể kết nối đến server.", "error");
      }
      this.closeUpdateModal();
    },
    handleFilter() {
      // Nếu là admin, cho phép chọn bất kỳ khách sạn nào
      if (this.isAdmin) {
        this.fetchBookings();
        return;
      }

      // Nếu là nhân viên, kiểm tra quyền truy cập khách sạn
      if (!this.isAdmin && this.selectedHotelId !== this.userHotelId) {
        Swal.fire(
          "Thông báo",
          "Bạn chỉ có thể chọn khách sạn mà bạn được phân quyền.",
          "warning"
        );
        this.selectedHotelId = this.userHotelId; // Reset về khách sạn của nhân viên
      }

      // Cập nhật kết quả đặt phòng
      this.fetchBookings();
    },
    extractHotelName(hotelName) {
      const index = hotelName.indexOf("ETHEREAL");
      if (index !== -1) {
        return hotelName.substring(index + "ETHEREAL".length).trim();
      }
      return hotelName;
    },
    // Xử lý phân trang
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchBookings();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchBookings();
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchBookings();
      }
    },
    // Tìm kiếm đặt phòng
    handleSearch() {
      this.currentPage = 1;
      this.fetchBookings();
    },

    // Xem chi tiết đặt phòng
    viewBookingDetails(booking) {
      this.selectedBooking = booking;
      this.isDetailModalOpen = true;
    },
    // Đóng modal chi tiết đặt phòng
    closeDetailModal() {
      this.isDetailModalOpen = false;
      this.selectedBooking = null;
    },
    // Định dạng tiền tệ
    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },
    // Định dạng ngày
    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN");
    },
    // Lấy nhãn trạng thái đặt phòng
    getStatusLabel(status) {
      switch (status) {
        case "NotYetPaid":
          return "Chưa thanh toán";
        case "Booked":
          return "Đã đặt";
        case "CheckedIn":
          return "Đã nhận phòng";
        case "CheckedOut":
          return "Đã trả phòng";
        case "Canceled":
          return "Đã hủy";
        default:
          return "Không xác định";
      }
    },
    // Lấy lớp CSS cho trạng thái
    getStatusClass(status) {
      return {
        "status-not-paid": status === "NotYetPaid",
        "status-booked": status === "Booked",
        "status-checked-in": status === "CheckedIn",
        "status-checked-out": status === "CheckedOut",
        "status-canceled": status === "Canceled",
      };
    },
  },
  mounted() {
    this.fetchBookings();
    this.fetchHotels();
  },
};
</script>

<style scoped>
.booking-management-container {
  padding: 20px;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-section input,
.filter-section select {
  padding: 8px;
  font-size: 16px;
}

.booking-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.booking-table th,
.booking-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.booking-table th {
  background-color: #f2f2f2;
}

.no-bookings {
  text-align: center;
  margin-top: 20px;
}

.status-not-paid {
  background-color: #f8d7da;
  color: #721c24;
}

.status-booked {
  background-color: #d4edda;
  color: #155724;
}

.status-checked-in {
  background-color: #fff3cd;
  color: #856404;
}

.status-checked-out {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-canceled {
  background-color: #f5c6cb;
  color: #721c24;
}

button {
  padding: 8px 12px;
  margin: 2px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #7274ff;
  color: #fff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 12px;
  margin: 0 4px;
  border: 1px solid #ccc;
  background-color: #f2f2f2;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination button.active {
  background-color: #7274ff;
  color: #fff;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.custom-modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  width: 750px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.custom-modal-content h2 {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 20px;
  color: #7274ff;
}

.info-group {
  margin-bottom: 10px;
}

.close-button {
  padding: 10px 20px;
  background-color: #7274ff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.section h3 {
  font-size: 18px;
  margin-bottom: 10px;
  border-bottom: 2px solid #7274ff;
  padding-bottom: 5px;
  color: #6d4c41;
}

.info-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-between;
}

.info-group p {
  font-size: 16px;
  margin: 5px 0;
}

.room-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.room-table th,
.room-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.room-table th {
  background-color: #f2f2f2;
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Nền overlay với hiệu ứng sáng nhẹ */
.status-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(1px); /* Làm mờ nền phía sau */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Nội dung modal với thiết kế sang trọng */
.status-modal-content {
  background: linear-gradient(145deg, #ffffff, #f8f8f8); /* Gradient sáng */
  border-radius: 15px;
  padding: 30px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); /* Bóng mềm mại */
  text-align: center;
  animation: fadeIn 0.4s ease; /* Hiệu ứng mờ dần */
}

/* Tiêu đề modal */
.status-modal-content h2 {
  font-size: 1.6rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 2px solid #7274ff;
  padding-bottom: 10px;
}

/* Các lựa chọn trạng thái */
.status-options label {
  display: flex;
  align-items: center;
  margin: 12px 0;
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.status-options label:hover {
  background-color: #f1f3f5;
}

.status-options input[type="radio"] {
  margin-right: 10px;
  accent-color: #7274ff; /* Màu cho radio button */
}

/* Nút cập nhật và đóng */
.update-button,
.close-button {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
  margin: 10px 5px;
}

/* Nút cập nhật */
.update-button {
  background: linear-gradient(145deg, #7274ff, #5a5ccf); /* Gradient */
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Bóng nhẹ */
  transition: background 0.3s ease; /* Thêm transition cho nền */
}

.update-button:hover {
  background: linear-gradient(145deg, #6d4c41, #5a3e36); /* Chuyển màu gradient khi hover */
}


.status-select {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  margin-bottom: 20px;
  font-size: 1rem;
  color: #555;
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}

.status-select:hover {
  background-color: #f0f0f0;
}

/* Nút đóng */
.close-button {
  background-color: #e0e0e0;
  color: #333;
}

.close-button:hover {
  background-color: #b0b0b0;
}

/* Hiệu ứng mở modal */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

</style>