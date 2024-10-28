<template>
  <div class="hotel-detail-container">
    <!-- Thông Tin Khách Sạn -->
    <div class="hotel-info-section">
      <h1>{{ hotel.NAME }}</h1>
      <img
        v-if="hotel.IMAGES && hotel.IMAGES.length > 0"
        :src="hotel.IMAGES[0]"
        alt="hotel-image"
        class="hotel-main-image"
      />
      <img
        v-else
        src="path/to/default-hotel-image.jpg"
        alt="default-hotel-image"
        class="hotel-main-image"
      />
      <p><strong>Địa chỉ:</strong> {{ fullAddress }}</p>
      <p>
        <strong>Trạng thái:</strong>
        {{ hotel.STATE ? "Hoạt động" : "Tạm ngừng" }}
      </p>
      <p><strong>Số điện thoại:</strong> {{ hotel.PHONE }}</p>
      <p><strong>Email:</strong> {{ hotel.EMAIL }}</p>
      <p><strong>Mô tả:</strong> {{ hotel.DESCRIPTION }}</p>
    </div>

    <!-- Quản Lý Phòng -->
    <div class="room-management-section">
      <div class="header">
        <h2>Quản Lý Phòng</h2>
        <div class="actions">
          <!-- Phần lọc theo loại phòng -->
          <label for="roomTypeFilter">Lọc theo loại phòng:</label>
          <select
            id="roomTypeFilter"
            v-model="selectedRoomType"
            @change="handleRoomTypeChange"
          >
            <option value="">Tất cả</option>
            <option v-for="type in roomTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>

          <!-- Phần lọc theo trạng thái phòng -->
          <label for="availabilityFilter">Trạng thái:</label>
          <select
            id="availabilityFilter"
            v-model="selectedAvailability"
            @change="handleAvailabilityChange"
          >
            <option value="">Tất cả</option>
            <option value="Đang Trống">Đang Trống</option>
            <option value="Đã Đặt">Đã Đặt</option>
          </select>

          <button class="add-room-button" @click="openAddRoomModal">
            + Thêm Phòng
          </button>
        </div>
      </div>

      <!-- Tabs cho phòng đang hoạt động và tạm ngừng hoạt động -->
      <div class="tabs">
        <button
          :class="{ active: selectedTab === 'active' }"
          @click="selectTab('active')"
        >
          Phòng đang hoạt động
        </button>
        <button
          :class="{ active: selectedTab === 'inactive' }"
          @click="selectTab('inactive')"
        >
          Phòng tạm ngừng hoạt động
        </button>
      </div>

      <!-- Bảng danh sách phòng -->
      <table class="room-table">
        <thead>
          <tr>
            <th>Số Phòng</th>
            <th>Loại Phòng</th>
            <th>Loại Giường</th>
            <th>Giá/Đêm (VND)</th>
            <th>Diện Tích (m²)</th>
            <th>Tầm Nhìn</th>
            <th>Tiện Nghi</th>
            <th>Trạng thái phòng</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in paginatedRooms" :key="room._id">
            <td>{{ room.ROOM_NUMBER }}</td>
            <td>{{ room.TYPE }}</td>
            <td>{{ room.CUSTOM_ATTRIBUTES.bedType }}</td>
            <td>{{ formatCurrency(room.PRICE_PERNIGHT) }}</td>
            <td>{{ room.CUSTOM_ATTRIBUTES.area }}</td>
            <td>{{ room.CUSTOM_ATTRIBUTES.view }}</td>
            <td>{{ room.CUSTOM_ATTRIBUTES.amenities }}</td>
            <td
              :class="getRoomStatusClass(room)"
              @click="openAvailabilityModal(room)"
              class="clickable-status"
            >
              {{ getRoomStatus(room) }}
            </td>
            <td>
              <button
                v-if="!room.IS_DELETED"
                class="edit-room-button"
                @click="openEditRoomModal(room)"
              >
                Chỉnh sửa
              </button>
              <button
                v-if="!room.IS_DELETED"
                class="delete-room-button"
                @click="confirmDeleteRoom(room._id)"
              >
                Xóa
              </button>
              <button
                v-if="room.IS_DELETED"
                class="restore-room-button"
                @click="restoreRoom(room._id)"
              >
                Kích hoạt lại
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Hiển thị thông báo khi không có phòng nào -->
      <div v-if="rooms.length === 0" class="no-rooms">
        <p>Không có phòng nào để hiển thị.</p>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Trước</button>
        <button
          v-for="page in pageNumbers"
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
    </div>

    <!-- Modal Thêm và Chỉnh Sửa Phòng -->
    <a-modal
      v-model:open="isRoomModalOpen"
      :title="isEditingRoom ? 'Chỉnh sửa Phòng' : 'Thêm Phòng Mới'"
      @ok="addOrUpdateRoom"
      @cancel="closeRoomModal"
      :width="700"
      :ok-button-props="{ loading: isSubmitting }"
      :destroy-on-close="true"
    >
      <form @submit.prevent="addOrUpdateRoom">
        <!-- Các trường thông tin phòng -->
        <div class="form-group">
          <label>Số Tầng:</label>
          <input v-model="currentRoom.FLOOR" type="number" required />
        </div>

        <div class="form-group">
          <label>Loại Phòng:</label>
          <select v-model="currentRoom.TYPE" required>
            <option value="Superior">Superior</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>

        <div class="form-group">
          <label>Giá Một Đêm (VND):</label>
          <input
            v-model.number="currentRoom.PRICE_PERNIGHT"
            type="number"
            required
          />
        </div>

        <div class="form-group">
          <label>Số Lượng Phòng:</label>
          <input v-model.number="quantity" type="number" min="1" required />
        </div>

        <div class="form-group">
          <label>Mô tả:</label>
          <textarea v-model="currentRoom.DESCRIPTION"></textarea>
        </div>

        <div class="form-group">
          <label>Loại Giường (Bed Type):</label>
          <select v-model="currentRoom.CUSTOM_ATTRIBUTES.bedType" required>
            <option value="Twin">Twin</option>
            <option value="Double ">Double</option>
            <option value="Triple ">Triple</option>
            <option value="King">King</option>
          </select>
          <!-- <input
            v-model="currentRoom.CUSTOM_ATTRIBUTES.bedType"
            type="text"
            placeholder="Nhập loại giường"
          /> -->
        </div>

        <div class="form-group">
          <label>Diện Tích (m²):</label>
          <input
            v-model.number="currentRoom.CUSTOM_ATTRIBUTES.area"
            type="number"
            placeholder="Nhập diện tích"
          />
        </div>

        <div class="form-group">
          <label>Tầm Nhìn (View):</label>
          <input
            v-model="currentRoom.CUSTOM_ATTRIBUTES.view"
            type="text"
            placeholder="Nhập tầm nhìn"
          />
        </div>

        <div class="form-group">
          <label>Tiện Nghi (Amenities):</label>
          <input
            v-model="currentRoom.CUSTOM_ATTRIBUTES.amenities"
            type="text"
            placeholder="Nhập tiện nghi"
          />
        </div>

        <!-- Nhập URL hoặc upload hình ảnh -->
        <div class="form-group">
          <label>Chọn cách nhập hình ảnh:</label>
          <select v-model="imageInputMethod">
            <option value="url">Nhập URL</option>
            <option value="file">Tải lên từ máy</option>
          </select>
        </div>

        <!-- Nếu chọn nhập URL -->
        <div v-if="imageInputMethod === 'url'" class="form-group">
          <label>Hình ảnh (URL):</label>
          <textarea
            v-model="imageUrlsInput"
            placeholder="Nhập URL hình ảnh, cách nhau bằng dấu phẩy hoặc xuống dòng"
            required
          ></textarea>
        </div>

        <!-- Nếu chọn tải ảnh từ máy -->
        <div v-if="imageInputMethod === 'file'" class="form-group">
          <label>Hình ảnh (từ máy):</label>
          <input
            type="file"
            @change="handleFileUpload"
            accept="image/*"
            multiple
          />
          <div class="image-previews" v-if="roomImagePreviews.length > 0">
            <img
              v-for="(img, index) in roomImagePreviews"
              :key="index"
              :src="img"
              class="preview-image"
            />
          </div>
        </div>
      </form>
    </a-modal>

    <!-- Modal Lịch Phòng -->
    <div v-if="isCalendarModalOpen" class="calendar-modal">
      <div class="calendar-modal-content">
        <span class="close" @click="closeCalendarModal">&times;</span>
        <h2>Lịch của phòng</h2>
        <div class="month-navigation">
          <button @click="prevMonth">&lt;</button>
          <span>{{ currentMonthName }} Năm {{ currentYear }}</span>
          <button @click="nextMonth">&gt;</button>
        </div>

        <!-- Bảng lịch -->
        <table class="calendar-table">
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
                :key="day.date + Math.random()"
                :class="{
                  'booked-day': day.isBooked, // Tô màu đỏ nhạt nếu ngày đã được đặt
                  empty: day.isEmpty,
                  'other-month': day.isOtherMonth && !day.isEmpty,
                }"
              >
                {{ day.label }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
import Swal from "sweetalert2";
import axiosClient from "../../api/axiosClient";

export default {
  props: ["id"],
  name: "HotelDetailDashboard",
  data() {
    return {
      hotel: {
        ADDRESS: {},
        IMAGES: [],
      },
      rooms: [],
      selectedTab: "active",
      isRoomModalOpen: false,
      isEditingRoom: false,
      currentRoom: {
        _id: "",
        ROOM_NUMBER: "",
        TYPE: "",
        PRICE_PERNIGHT: 0,
        DESCRIPTION: "",
        IMAGES: [""],
        CUSTOM_ATTRIBUTES: {
          bedType: "",
          area: 0,
          view: "",
          amenities: "",
        },
      },
      selectedRoomFiles: null,
      roomImagePreviews: [],
      imageInputMethod: "url",
      isLoading: true,
      // Modal Availability
      isAvailabilityModalOpen: false,
      selectedRoom: null, // Phòng được chọn để xem lịch

      // Custom Calendar Modal
      isCalendarModalOpen: false,
      calendar: [], // Mảng chứa các tuần trong tháng hiện tại
      currentMonthIndex: new Date().getMonth(), // Tháng hiện tại (0-11)
      currentYear: new Date().getFullYear(),
      selectedStartDate: null,
      selectedEndDate: null,
      currentMonthIndex: new Date().getMonth(), // Tháng hiện tại (0-11)
      currentYear: new Date().getFullYear(),
      quantity: 1,
      imageUrlsInput: "",
      isSubmitting: false,
      selectedRoomType: "",
      selectedAvailability: "",
      currentPage: 1, // Trang hiện tại
      pageSize: 10,
    };
  },
  computed: {
    fullAddress() {
      const { ADDRESS_LINE, WARD, DISTRICT, CITY, COUNTRY } =
        this.hotel.ADDRESS || {};
      return `${ADDRESS_LINE}, ${WARD}, ${DISTRICT}, ${CITY}, ${COUNTRY}`;
    },
    currentMonthName() {
      return new Date(this.currentYear, this.currentMonthIndex).toLocaleString(
        "vi-VN",
        { month: "long" }
      );
    },
    filteredRooms() {
      let rooms = this.rooms;

      // Lọc phòng theo tab đã chọn (đang hoạt động hoặc tạm ngừng hoạt động)
      if (this.selectedTab === "active") {
        rooms = rooms.filter((room) => !room.IS_DELETED);
      } else {
        rooms = rooms.filter((room) => room.IS_DELETED);
      }

      // Lọc theo loại phòng nếu có
      if (this.selectedRoomType) {
        rooms = rooms.filter((room) => room.TYPE === this.selectedRoomType);
      }

      // Lọc theo trạng thái phòng nếu có
      if (this.selectedAvailability) {
        rooms = rooms.filter(
          (room) => this.getRoomStatus(room) === this.selectedAvailability
        );
      }

      return rooms;
    },
    roomTypes() {
      const types = new Set();
      this.rooms.forEach((room) => {
        types.add(room.TYPE);
      });
      return Array.from(types);
    },

    paginatedRooms() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredRooms.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredRooms.length / this.pageSize);
    },
    pageNumbers() {
      const pages = [];
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    selectTab(tab) {
      this.selectedTab = tab; // Đổi tab khi người dùng chọn
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    goToPage(pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
      }
    },
    handleRoomTypeChange() {
      this.currentPage = 1; // Reset về trang đầu khi thay đổi loại phòng
    },
    handleAvailabilityChange() {
      this.currentPage = 1; // Reset về trang đầu khi thay đổi trạng thái phòng
    },
    async restoreRoom(roomId) {
      // Hiển thị hộp thoại xác nhận
      const result = await Swal.fire({
        title: "Bạn có chắc chắn muốn kích hoạt lại phòng này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Kích hoạt",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      // Nếu người dùng xác nhận, tiến hành kích hoạt lại phòng
      if (result.isConfirmed) {
        try {
          const response = await axiosClient.put(
            `/rooms/updateRoom/${roomId}`,
            {
              IS_DELETED: false,
            }
          );

          if (response.data.success) {
            Swal.fire("Thành công", "Phòng đã được kích hoạt lại.", "success");
            this.fetchRooms(); // Cập nhật lại danh sách phòng sau khi thay đổi
          } else {
            Swal.fire("Lỗi", "Không thể kích hoạt lại phòng.", "error");
          }
        } catch (error) {
          Swal.fire("Lỗi", "Không thể kích hoạt lại phòng.", "error");
        }
      }
    },
    // Lấy thông tin chi tiết khách sạn
    async fetchHotelDetail() {
      const hotelId = this.$route.params.id;
      try {
        const response = await axiosClient.get(
          `/hotels/getHotelById/${hotelId}`
        );
        if (response.data.success) {
          this.hotel = response.data.data; // Điều chỉnh theo cấu trúc phản hồi backend
        } else {
          console.error("Lỗi trong phản hồi API:", response.data.message);
          Swal.fire(
            "Lỗi",
            response.data.message || "Không thể lấy thông tin khách sạn.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error fetching hotel details:", error);
        Swal.fire("Lỗi", "Không thể lấy thông tin khách sạn.", "error");
      } finally {
        this.isLoading = false;
      }
    },
    // Lấy danh sách tất cả các phòng trong khách sạn sử dụng endpoint mới
    async fetchRooms() {
      const hotelId = this.$route.params.id;
      try {
        const response = await axiosClient.get(
          `/rooms/getAllRoomsInHotel/${hotelId}`
        );
        if (response.data.success) {
          // Sắp xếp các phòng theo ROOM_NUMBER tăng dần
          this.rooms = response.data.rooms.slice().sort((a, b) => {
            const numA = parseInt(a.ROOM_NUMBER, 10);
            const numB = parseInt(b.ROOM_NUMBER, 10);
            return numA - numB;
          });
          console.log("Rooms fetched and sorted:", this.rooms);
        } else {
          console.error("Lỗi trong phản hồi API:", response.data.message);
          this.rooms = [];
          Swal.fire(
            "Lỗi",
            response.data.message || "Không thể lấy danh sách phòng.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        this.rooms = [];
        Swal.fire("Lỗi", "Không thể lấy danh sách phòng.", "error");
      }
    },
    // Định dạng tiền tệ
    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },
    // Xử lý upload hình ảnh phòng
    handleFileUpload(event) {
      const files = event.target.files;
      this.selectedRoomFiles = files;
      this.roomImagePreviews = []; // Reset các hình ảnh preview

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.roomImagePreviews.push(e.target.result);
          };
          reader.readAsDataURL(files[i]);
        }
      }
    },
    // Mở modal thêm phòng
    openAddRoomModal() {
      this.resetRoomForm();
      this.isEditingRoom = false;
      this.isRoomModalOpen = true;
    },
    // Mở modal chỉnh sửa phòng
    openEditRoomModal(room) {
      this.currentRoom = JSON.parse(JSON.stringify(room)); // Sao chép sâu
      this.isEditingRoom = true;
      this.isRoomModalOpen = true;
      // Nếu phòng đã có hình ảnh, hiển thị chúng
      this.roomImagePreviews = room.IMAGES || [];
    },

    // Đóng modal phòng
    closeRoomModal() {
      this.resetRoomForm();
      this.isRoomModalOpen = false;
    },
    // Reset form phòng
    resetRoomForm() {
      this.currentRoom = {
        _id: "",
        FLOOR: 1,
        TYPE: "",
        PRICE_PERNIGHT: 0,
        DESCRIPTION: "",
        CUSTOM_ATTRIBUTES: {
          bedType: "",
          area: 0,
          view: "",
          amenities: "",
        },
        IMAGES: [],
      };
      this.selectedRoomFiles = null;
      this.roomImagePreviews = [];
      this.imageInputMethod = "url"; // Reset về 'url' hoặc giá trị mặc định của bạn
      this.imageUrlsInput = ""; // Reset chuỗi URL nhập vào
      // this.isEditingRoom = false;
    },

    isValidUrl(url) {
      const pattern = new RegExp(
        "^(https?:\\/\\/)" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?" + // port
          "(\\/[-a-z\\d%_.~+]*)*" + // path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      ); // fragment locator
      return !!pattern.test(url);
    },
    async addRoom() {
      try {
        const formData = new FormData();
        const hotelId = this.$route.params.id;

        // Chuẩn bị dữ liệu roomData cho phòng mới
        const roomData = {
          HOTEL_ID: hotelId,
          FLOOR: this.currentRoom.FLOOR,
          TYPE: this.currentRoom.TYPE,
          PRICE_PERNIGHT: this.currentRoom.PRICE_PERNIGHT,
          DESCRIPTION: this.currentRoom.DESCRIPTION,
          CUSTOM_ATTRIBUTES: {
            bedType: this.currentRoom.CUSTOM_ATTRIBUTES.bedType,
            area: this.currentRoom.CUSTOM_ATTRIBUTES.area,
            view: String(this.currentRoom.CUSTOM_ATTRIBUTES.view),
            amenities: this.currentRoom.CUSTOM_ATTRIBUTES.amenities,
          },
          IMAGES: [], // Sẽ xử lý ảnh dưới đây
        };

        // Xử lý ảnh từ URL
        if (this.imageInputMethod === "url" && this.imageUrlsInput.trim()) {
          const urls = this.imageUrlsInput
            .split(/[\n,]+/)
            .map((url) => url.trim())
            .filter((url) => url);

          urls.forEach((url) => {
            if (this.isValidUrl(url)) {
              roomData.IMAGES.push(url);
            } else {
              console.warn(`URL không hợp lệ: ${url}`);
            }
          });
        }

        // Thêm roomData vào FormData
        formData.append("roomData", JSON.stringify(roomData));
        formData.append("quantity", this.quantity); // Số lượng phòng

        // Xử lý ảnh từ file
        if (this.imageInputMethod === "file" && this.selectedRoomFiles) {
          for (let i = 0; i < this.selectedRoomFiles.length; i++) {
            formData.append("IMAGES[]", this.selectedRoomFiles[i]);
          }
        }

        // Gửi request thêm phòng
        const response = await axiosClient.post("/rooms/createRoom", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.success) {
          Swal.fire("Thành công", "Thêm mới phòng thành công.", "success");
          this.fetchRooms();
          this.isRoomModalOpen = false;
          this.resetRoomForm();
        }
      } catch (error) {
        Swal.fire("Lỗi", "Thêm mới phòng thất bại.", "error");
      }
    },
    async updateRoom() {
  try {
    console.log("updateRoom called");
    this.isSubmitting = true;
    const roomId = this.currentRoom._id;

    // Lấy dữ liệu gốc từ server
    const response = await axiosClient.get(`/rooms/getRoomById/${roomId}`);
    const originalData = response.data.room;

    console.log("originalData:", originalData);

    // Giữ lại các trường trong CUSTOM_ATTRIBUTES không thay đổi
    const updatedCustomAttributes = {
      ...originalData.CUSTOM_ATTRIBUTES, // Giữ nguyên các trường cũ
      ...this.currentRoom.CUSTOM_ATTRIBUTES, // Ghi đè bằng các trường đã chỉnh sửa
    };

    // Chuẩn bị dữ liệu cập nhật
    const formData = new FormData();

    // Kiểm tra các trường chính
    if (this.currentRoom.FLOOR !== originalData.FLOOR) {
      formData.append("FLOOR", this.currentRoom.FLOOR);
    }
    if (this.currentRoom.TYPE !== originalData.TYPE) {
      formData.append("TYPE", this.currentRoom.TYPE);
    }
    if (this.currentRoom.PRICE_PERNIGHT !== originalData.PRICE_PERNIGHT) {
      formData.append("PRICE_PERNIGHT", this.currentRoom.PRICE_PERNIGHT);
    }
    if (this.currentRoom.DESCRIPTION !== originalData.DESCRIPTION) {
      formData.append("DESCRIPTION", this.currentRoom.DESCRIPTION);
    }

    // Cập nhật CUSTOM_ATTRIBUTES
    formData.append(
      "CUSTOM_ATTRIBUTES[bedType]",
      updatedCustomAttributes.bedType
    );
    formData.append("CUSTOM_ATTRIBUTES[area]", updatedCustomAttributes.area);
    formData.append("CUSTOM_ATTRIBUTES[view]", updatedCustomAttributes.view);
    formData.append(
      "CUSTOM_ATTRIBUTES[amenities]",
      updatedCustomAttributes.amenities
    );

    // Kiểm tra và xử lý ảnh
    if (
      this.imageInputMethod === "url" &&
      this.currentRoom.IMAGES[0] !== originalData.IMAGES[0]
    ) {
      formData.append("IMAGES[]", this.currentRoom.IMAGES[0]);
    } else if (this.imageInputMethod === "file" && this.selectedRoomFiles) {
      for (let i = 0; i < this.selectedRoomFiles.length; i++) {
        formData.append("IMAGES[]", this.selectedRoomFiles[i]);
      }
    }

    // Kiểm tra xem có thay đổi nào không
    if ([...formData.keys()].length === 0) {
      Swal.fire("Thông báo", "Không có thay đổi nào để cập nhật.", "info");
      this.isSubmitting = false;
      return;
    }

    // Gửi request cập nhật phòng
    await axiosClient.put(`/rooms/updateRoom/${roomId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    Swal.fire("Thành công", "Chỉnh sửa phòng thành công.", "success");

    // Cập nhật danh sách phòng và đóng modal
    await this.fetchRooms();
    this.isRoomModalOpen = false;
    this.resetRoomForm();
  } catch (error) {
    Swal.fire("Lỗi", "Không thể chỉnh sửa phòng.", "error");
  } finally {
    this.isSubmitting = false;
  }
},

    async addOrUpdateRoom() {
      const isEditingRoom = this.isEditingRoom; // Lưu trữ giá trị
      console.log("addOrUpdateRoom called, isEditingRoom:", isEditingRoom);
      if (isEditingRoom) {
        await this.updateRoom();
      } else {
        await this.addRoom();
      }
    },
    async confirmDeleteRoom(roomId) {
      const result = await Swal.fire({
        title: "Bạn có chắc chắn muốn xóa khách sạn này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
      });

      if (result.isConfirmed) {
        try {
          await this.deleteRoom(roomId); // Gọi hàm deleteHotel để thực hiện xóa
          Swal.fire("Đã xóa!", "Phòng đã được xóa thành công.", "success");
        } catch (error) {
          Swal.fire("Lỗi", "Không thể xóa phòng.", "error");
        }
      }
    },
    // Xóa phòng
    async deleteRoom(roomId) {
      try {
        // Sử dụng phương thức POST theo backend bạn đã cung cấp
        await axiosClient.post(`/rooms/deleteRoom/${roomId}`);
        await this.fetchRooms();
      } catch (error) {
        console.error("Error deleting room:", error);
        throw error;
      }
    },
    // Lấy ngày hôm nay dưới định dạng 'YYYY-MM-DD'
    getTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = ("0" + (today.getMonth() + 1)).slice(-2);
      const day = ("0" + today.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    },
    // Lấy trạng thái phòng dựa trên ngày hôm nay
    getRoomStatus(room) {
      return room.CURRENT_STATUS || "Đang Trống";
    },

    getRoomStatusClass(room) {
      const status = this.getRoomStatus(room);
      if (status === "Đang Trống") {
        return "status-available";
      } else if (status === "Đã Đặt") {
        return "status-not-available";
      } else if (status === "Trả Phòng") {
        return "status-checking-out";
      }
      return "";
    },

    // Mở modal lịch phòng
    openAvailabilityModal(room) {
      this.selectedRoom = room;
      this.isCalendarModalOpen = true;
      this.initializeCalendar();
    },
    // Đóng modal lịch phòng
    closeCalendarModal() {
      this.selectedRoom = null;
      this.isCalendarModalOpen = false;
      this.resetSelectedDates();
    },
    // Reset các ngày đã chọn
    resetSelectedDates() {
      this.selectedStartDate = null;
      this.selectedEndDate = null;
    },
    // Initialize Calendar
    initializeCalendar() {
      this.currentMonthIndex = new Date().getMonth();
      this.currentYear = new Date().getFullYear();
      this.generateCalendar();
    },

    // Generate Calendar Data
    generateCalendar() {
      this.calendar = [];
      const firstDayOfMonth = new Date(
        this.currentYear,
        this.currentMonthIndex,
        1
      );
      const startingDay = firstDayOfMonth.getDay(); // CN = 0, T2 = 1, ..., T7 = 6
      const daysInMonth = new Date(
        this.currentYear,
        this.currentMonthIndex + 1,
        0
      ).getDate();

      let week = [];
      // Điền các ô trống cho ngày của tháng trước
      for (let i = 0; i < startingDay; i++) {
        week.push({ label: "", isEmpty: true });
      }

      // Điền các ngày của tháng hiện tại
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(this.currentYear, this.currentMonthIndex, day);
        const dateStr = date.toISOString().split("T")[0];

        week.push({
          label: day,
          date: dateStr,
          isEmpty: false,
          isBooked: this.isBookedDate(dateStr), // Kiểm tra xem ngày có được đặt không
          isOtherMonth: false,
        });

        if (week.length === 7) {
          this.calendar.push([...week]);
          week = [];
        }
      }

      // Điền các ô trống cho ngày của tháng sau
      if (week.length > 0) {
        while (week.length < 7) {
          week.push({ label: "", isEmpty: true });
        }
        this.calendar.push([...week]);
      }
    },

    // Kiểm tra xem ngày có được đặt hay không
    isBookedDate(dateStr) {
      if (!this.selectedRoom || !this.selectedRoom.AVAILABILITY) return false;
      return this.selectedRoom.AVAILABILITY.some(
        (item) => item.DATE.startsWith(dateStr) && !item.AVAILABLE
      );
    },

    // Check if a date is available
    checkAvailability(dateStr) {
      if (!this.selectedRoom || !this.selectedRoom.AVAILABILITY) return false;
      const availability = this.selectedRoom.AVAILABILITY.find((item) =>
        item.DATE.startsWith(dateStr)
      );
      return availability ? availability.AVAILABLE : true; // Giả sử phòng trống nếu không có thông tin
    },
    // Navigate to previous month
    prevMonth() {
      if (this.currentMonthIndex === 0) {
        this.currentMonthIndex = 11;
        this.currentYear--;
      } else {
        this.currentMonthIndex--;
      }
      this.generateCalendar();
    },

    // Navigate to next month
    nextMonth() {
      if (this.currentMonthIndex === 11) {
        this.currentMonthIndex = 0;
        this.currentYear++;
      } else {
        this.currentMonthIndex++;
      }
      this.generateCalendar();
    },
    // Select a date
    selectDate(day) {
      if (day.isPast || !day.isAvailable || !day.date) return;

      if (
        !this.selectedStartDate ||
        (this.selectedStartDate && this.selectedEndDate)
      ) {
        this.selectedStartDate = day.date;
        this.selectedEndDate = null;
      } else if (this.selectedStartDate && !this.selectedEndDate) {
        if (day.date < this.selectedStartDate) {
          this.selectedStartDate = day.date;
        } else {
          this.selectedEndDate = day.date;
        }
      }
    },
    // Check if a date is selected
    isSelectedDate(date) {
      return date === this.selectedStartDate || date === this.selectedEndDate;
    },
    // Format date for display
    formatDate(date) {
      if (!date) return "";
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(date).toLocaleDateString("vi-VN", options);
    },
    // Confirm selected dates
    confirmDates() {
      if (this.selectedStartDate && this.selectedEndDate) {
        // Thực hiện các hành động sau khi chọn ngày
        // Ví dụ: Gọi API để kiểm tra hoặc cập nhật trạng thái phòng
        console.log(
          "Selected Dates:",
          this.selectedStartDate,
          this.selectedEndDate
        );
        Swal.fire(
          "Thành công",
          `Đã chọn ngày: ${this.formatDate(
            this.selectedStartDate
          )} - ${this.formatDate(this.selectedEndDate)}`,
          "success"
        );
        this.closeCalendarModal();
      } else {
        Swal.fire(
          "Cảnh báo",
          "Vui lòng chọn ngày nhận và trả phòng.",
          "warning"
        );
      }
    },
  },
  mounted() {
    this.fetchHotelDetail();
    this.fetchRooms();
  },
};
</script>
<style scoped>
/* Container chính của trang chi tiết khách sạn */
.hotel-detail-container {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* Phần thông tin khách sạn */
.hotel-info-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.hotel-info-section h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
}

.hotel-main-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.hotel-main-image:hover {
  transform: scale(1.02);
}

.hotel-info-section p {
  font-size: 16px;
  color: #555;
  margin: 8px 0;
}

.hotel-info-section p strong {
  color: #333;
}

/* Phần quản lý phòng */
.room-management-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header .actions {
  display: flex;
  align-items: center;
}

.header .actions label {
  margin-right: 10px;
  font-weight: bold;
}

.header .actions select {
  margin-right: 15px;
  padding: 5px 10px;
  font-size: 16px;
}

/* Header quản lý phòng */
.room-management-section .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.room-management-section .header h2 {
  font-size: 24px;
  color: #333;
}

.add-room-button {
  background-color: #28a745;
  color: #fff;
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.add-room-button:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Bảng danh sách phòng */
.room-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.room-table th,
.room-table td {
  border: 1px solid #ddd;
  padding: 12px 15px;
  text-align: center;
}

.room-table th {
  background-color: #f2f2f2;
  color: #333;
}

.room-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.room-table tbody tr:hover {
  background-color: #f1f1f1;
}

/* Style cho các nút hành động trong bảng */
.edit-room-button,
.delete-room-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 2px;
  transition: background-color 0.3s ease;
}

.edit-room-button {
  background-color: #007bff;
  color: #fff;
}

.edit-room-button:hover {
  background-color: #0056b3;
}

.delete-room-button {
  background-color: #dc3545;
  color: #fff;
}

.delete-room-button:hover {
  background-color: #c82333;
}

/* Hiển thị thông báo khi không có phòng nào */
.no-rooms {
  text-align: center;
  font-size: 18px;
  color: #666;
  padding: 20px;
}

/* Modal thêm và chỉnh sửa phòng */
/* Modal container */
.custom-modal .ant-modal-content {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Tiêu đề của modal */
.custom-modal .ant-modal-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

/* Nút xác nhận và hủy trong modal */
.custom-modal .ant-btn-primary {
  background-color: #7274ff;
  border-color: #7274ff;
  color: #fff;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.custom-modal .ant-btn-primary:hover {
  background-color: #5b5ed7;
  border-color: #5b5ed7;
}

.custom-modal .ant-btn-default {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.custom-modal .ant-btn-default:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

/* Custom form group style */
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #7274ff;
  outline: none;
}

/* Customize preview image display */
.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.preview-image {
  width: 100px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}

/* Add subtle hover effect to preview images */
.preview-image:hover {
  border-color: #7274ff;
  transform: scale(1.05);
  transition: all 0.2s ease;
}

/* Khoảng cách giữa các trường form trong modal */
.custom-modal .form-group {
  margin-bottom: 20px;
}

/* Điều chỉnh khoảng cách và canh lề cho các phần tử trong modal */
.custom-modal .ant-modal-body {
  padding: 20px;
}

.custom-modal .ant-modal-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* Hiệu ứng khi người dùng nhập vào các trường */
.custom-modal input:focus,
.custom-modal select:focus,
.custom-modal textarea:focus {
  box-shadow: 0 0 5px rgba(114, 116, 255, 0.5);
  border-color: #7274ff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
/* Nút "OK" và "Cancel" trong modal */
.custom-modal .ant-btn-primary,
.custom-modal .ant-btn-default {
  width: 120px;
  height: 40px;
  border-radius: 8px;
  font-size: 16px;
  transition: transform 0.2s ease;
}

.custom-modal .ant-btn-primary:hover,
.custom-modal .ant-btn-default:hover {
  transform: translateY(-3px); /* Thêm hiệu ứng hover cho nút */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
/* Phần upload file ảnh từ máy */
.custom-modal .form-group input[type="file"] {
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
}

.custom-modal .form-group input[type="file"]::-webkit-file-upload-button {
  background-color: #7274ff;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.custom-modal .form-group input[type="file"]::-webkit-file-upload-button:hover {
  background-color: #5b5ed7;
}

/* Các lớp CSS cho trạng thái phòng */
.status-available {
  background-color: #d4edda;
  color: #155724;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.status-not-available {
  background-color: #f8d7da;
  color: #721c24;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

/* Đổi con trỏ khi hover vào trạng thái phòng */
.clickable-status:hover {
  opacity: 0.8;
}

/* Custom Calendar Modal Styles */
.calendar-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Đặt z-index cao hơn modal thông tin phòng */
}

.calendar-table td.other-month {
  background-color: transparent; /* Loại bỏ màu nâu */
  color: #ccc; /* Bạn có thể thay đổi màu chữ hoặc giữ nguyên */
}

.calendar-table td.empty {
  background-color: transparent;
  cursor: default;
  pointer-events: none;
  border: none;
}

.calendar-modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 800px;
  max-width: 90%;
  position: relative;
  text-align: center;
}

.calendar-modal-content .close {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 30px;
  cursor: pointer;
}

.calendar-table {
  width: 100%;
  border-collapse: collapse;
}

.calendar-table th,
.calendar-table td {
  width: 14.28%;
  height: 80px;
  text-align: center;
  border: 1px solid #ddd;
  cursor: pointer;
}

.calendar-table td.empty {
  background-color: transparent;
}

.calendar-table td.booked-day {
  background-color: rgba(255, 0, 0, 0.1);
}

.calendar-table td.selected {
  background-color: #7274ff;
  color: #fff;
}

.selected-dates p {
  margin: 5px 0;
}

.calendar-modal-content button.confirm-button {
  padding: 10px 20px;
  background-color: #3e2723;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}

.calendar-modal-content button.confirm-button:hover {
  background-color: #5a3b31;
}

.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.month-navigation button {
  padding: 5px 10px;
  background-color: #6d4c41;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.month-navigation button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.month-navigation span {
  font-weight: bold;
  font-size: 18px;
}

.selected-dates {
  display: flex;
  justify-content: center; /* Căn đều giữa các phần tử */
  align-items: center; /* Căn giữa dọc */
  margin-top: 20px;
}

.date-range {
  display: flex;
  flex-direction: column; /* Căn dọc các phần tử */
  font-size: 18px;
  font-weight: bold;
}

.date-display {
  font-size: 16px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
  text-align: center; /* Căn giữa nội dung */
}

.confirm-button {
  margin-top: 20px;
  background-color: #3e2723;
  color: #fff;
  padding: 10px 20px;
  font-size: 18px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.confirm-button:hover {
  background-color: #5a3b31;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  margin: 0 5px;
  padding: 8px 12px;
  background-color: #f2f2f2;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button.active {
  background-color: #007bff;
  color: #fff;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status-checking-out {
  background-color: #fff3cd; /* Màu vàng nhạt */
  color: #856404; /* Màu chữ nâu */
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  cursor: pointer;
  border: 1px solid #ccc;
  background-color: #f2f2f2;
  font-size: 16px;
  transition: background-color 0.3s;
}

.tabs button.active {
  background-color: #7274ff;
  color: #fff;
}

.tabs button:not(:last-child) {
  border-right: none;
}
</style>
