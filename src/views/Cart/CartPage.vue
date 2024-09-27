<template>
  <div class="cart-container">
    <h3>Giỏ hàng của bạn</h3>

    <!-- Phần đầu của bảng -->
    <table class="custom-table">
      <thead>
        <tr>
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
            <td colspan="8" class="hotel-name">
              <i class="fa fa-hotel"></i> {{ hotel.HOTEL_NAME }}
            </td>
          </tr>

          <tr v-for="(room, roomIndex) in hotel.ROOMS" :key="roomIndex">
            <td class="image-column">
              <img
                :src="room.imageUrl || '/assets/default-room.jpg'"
                alt="Room Image"
                class="room-image"
              />
            </td>
            <td>{{ room.type }}</td>
            <td>{{ room.pricePerNight.toLocaleString() }} VND</td>
            <td>
              <p>
                {{ formatDate(room.startDate) }} -
                {{ formatDate(room.endDate) }}
              </p>
              <p>{{ calculateStayDuration(room.startDate, room.endDate) }}</p>
            </td>
            <td>
              <div class="room-number-box">
                {{ room.roomNumber }}
              </div>
            </td>
            <td>{{ room.people }}</td>
            <td>{{ room.totalPrice.toLocaleString() }} VND</td>
            <td>
              <button class="edit-btn" @click="showUpdateModal(room)">Chỉnh sửa</button>
              <button class="delete-btn" @click="removeRoom(room.ROOM_ID)">
                Xóa
              </button>
              <button class="book-btn" @click="bookRoom(room)">
                Đặt phòng
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <!-- Modal for updating room information -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>Cập nhật phòng</h2>

        <div class="form-group">
          <label for="startDate">Ngày bắt đầu:</label>
          <input
            type="date"
            id="startDate"
            v-model="selectedRoom.newStartDate"
          />
        </div>

        <div class="form-group">
          <label for="endDate">Ngày kết thúc:</label>
          <input type="date" id="endDate" v-model="selectedRoom.newEndDate" />
        </div>

        <div class="modal-buttons">
          <button class="update-btn" @click="confirmUpdateRoom">Cập nhật</button>
          <button class="cancel-btn" @click="closeModal">Hủy</button>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Cập Nhật -->
    <!-- <div v-if="showUpdateConfirmModal" class="modal">
  <div class="modal-content">
    <h2>Xác nhận cập nhật</h2>
    <p>Bạn có chắc chắn muốn cập nhật thông tin phòng này không?</p>
    <div class="modal-buttons">
      <button class="update-btn" @click="updateRoom">Cập nhật</button>
      <button class="cancel-btn" @click="closeUpdateConfirmModal">Hủy</button>
    </div>
  </div>
</div> -->

    <!-- Modal Xác Nhận Xóa -->
    <!-- <div v-if="showDeleteConfirmModal" class="modal">
  <div class="modal-content">
    <h2>Xác nhận xóa</h2>
    <p>Bạn có chắc chắn muốn xóa phòng này không?</p>
    <div class="modal-buttons">
      <button class="delete-btn" @click="removeRoom">Xóa</button>
      <button class="cancel-btn" @click="closeDeleteConfirmModal">Hủy</button>
    </div>
  </div>
</div> -->
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import Swal from 'sweetalert2';

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
    };
  },
  async created() {
    await this.fetchCartData();
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    },
  },
  methods: {
    // Phương thức gọi API để lấy dữ liệu giỏ hàng
    async fetchCartData() {
      try {
        const response = await axiosClient.post("/carts/getCartByUserId");
        if (response.data.cart && response.data.cart.HOTELS) {
          this.hotels = response.data.cart.HOTELS.map((hotel) => ({
            HOTEL_NAME: hotel.HOTEL_NAME, // Tên khách sạn
            ROOMS: hotel.ROOMS.map((room) => ({
              imageUrl: room.IMAGES[0] || "/assets/default-room.jpg", // URL ảnh đầu tiên hoặc ảnh mặc định
              type: `${room.TYPE} ${room.CUSTOM_ATTRIBUTES.bedType}`, // Loại phòng + loại giường
              pricePerNight: room.PRICE_PERNIGHT, // Giá mỗi đêm
              roomNumber: room.ROOM_NUMBER, // Số phòng
              startDate: room.START_DATE, // Ngày bắt đầu
              endDate: room.END_DATE, // Ngày kết thúc
              people: room.CUSTOM_ATTRIBUTES.number_of_people || 1, // Số người
              totalPrice: room.TOTAL_PRICE_FOR_ROOM, // Tổng giá cho phòng
              ROOM_ID: room.ROOM_ID, // ID phòng
            })),
          }));
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    },

    // Phương thức định dạng ngày tháng
    formatDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("vi-VN", options);
    },

    // Phương thức tính thời gian ở (ví dụ: "3 ngày 2 đêm")
    calculateStayDuration(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Tính số ngày ở
      const nights = duration - 1;
      return `${duration} ngày ${nights} đêm`;
    },

    async removeRoom(roomId) {
    try {
      const result = await Swal.fire({
        title: 'Bạn chắc chắn muốn xóa phòng này không?',
        text: 'Hành động này không thể hoàn tác!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        await axiosClient.post('/carts/removeRoomFromCart', { roomId });
        this.fetchCartData();
        Swal.fire('Đã xóa!', 'Phòng đã được xóa khỏi giỏ hàng.', 'success');
      }
    } catch (error) {
      console.error('Error removing room:', error);
      Swal.fire('Lỗi!', 'Có lỗi xảy ra khi xóa phòng.', 'error');
    }
  },

    // Phương thức đặt phòng
    async bookRoom(room) {
      console.log(`Booking room with ID: ${room.ROOM_ID}`);
      // Thêm logic đặt phòng ở đây
    },

    // Phương thức hiển thị modal chỉnh sửa
    showUpdateModal(room) {
      this.selectedRoom = {
        roomId: room.ROOM_ID,
        newStartDate: room.startDate.split("T")[0],
        newEndDate: room.endDate.split("T")[0],
      };
      this.showModal = true; // Hiển thị modal cập nhật
    },

    // Phương thức đóng modal
    closeModal() {
      this.showModal = false;
    },

    async confirmUpdateRoom() {
    try {
      const result = await Swal.fire({
        title: 'Bạn chắc chắn muốn cập nhật thông tin phòng này không?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Cập nhật',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        this.updateRoom(); // Gọi phương thức cập nhật phòng
      }
    } catch (error) {
      console.error("Error confirming update:", error);
      Swal.fire('Lỗi!', 'Có lỗi xảy ra khi xác nhận cập nhật.', 'error');
    }
  },

    // Phương thức cập nhật thông tin phòng
    async updateRoom() {
      try {
        await axiosClient.post("/carts/updateRoomInCart", {
          roomId: this.selectedRoom.roomId,
          newStartDate: this.selectedRoom.newStartDate,
          newEndDate: this.selectedRoom.newEndDate,
        });

        await this.fetchCartData();
        this.closeModal();
        Swal.fire('Thành công!', 'Thông tin phòng đã được cập nhật.', 'success');
      } catch (error) {
        console.error("Error updating room:", error);
        Swal.fire('Lỗi!', 'Có lỗi xảy ra khi cập nhật phòng.', 'error');
      }
    },
  },
};
</script>

<style scoped>
.cart-container {
  width: 100%;
  overflow-x: auto;
  margin: 20px auto;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.custom-table thead {
  background-color: #f4f4f4;
}

.custom-table th,
.custom-table td {
  padding: 20px 20px;
  border-bottom: 1px solid #ddd;
  color: #6d4c41;
  text-align: center;
}

.custom-table th {
  font-weight: bold;
  color: #2c3e50;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #f2f2f2;
}

.custom-table .room-image {
  width: 250px; /* Giảm kích thước ảnh */
  height: 150px;
  border-radius: 4px;
  object-fit: cover;
}

.edit-btn,
.delete-btn,
.book-btn {
  padding: 5px 10px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background-color: #3498db;
  color: #fff;
}

.delete-btn {
  background-color: #e74c3c;
  color: #fff;
}

.book-btn {
  background-color: #6d4c41;
  color: #fff;
}

.edit-btn:hover,
.delete-btn:hover,
.book-btn:hover {
  opacity: 0.8;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  color: #6d4c41;
}

.room-number-box {
  border: 2px solid #6d4c41;
  border-radius: 5px;
  padding: 5px 10px;
  display: inline-block;
}
.custom-table .hotel-name {
  text-align: left;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
  margin-top: 0;
  color: #6d4c41;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
}

.update-btn,
.cancel-btn {
  padding: 8px 16px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.update-btn {
  background-color: #28a745;
  color: #fff;
}

.cancel-btn {
  background-color: #6c757d;
  color: #fff;
}

.update-btn:hover,
.cancel-btn:hover {
  opacity: 0.9;
}
</style>
