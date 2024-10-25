<template>
  <div class="hotel-list-container">
    <div class="header-container">
      <h1 class="page-title">Danh Sách Khách Sạn</h1>
      <button class="add-hotel-button" @click="openAddHotelModal">
        + Thêm Khách Sạn
      </button>
    </div>

    <!-- Tabs for active and inactive hotels -->
    <div class="tabs">
      <button
        :class="{ 'active-tab': activeTab === 'active' }"
        @click="activeTab = 'active'"
      >
        Khách Sạn Đang Hoạt Động
      </button>
      <button
        :class="{ 'active-tab': activeTab === 'inactive' }"
        @click="activeTab = 'inactive'"
      >
        Khách Sạn Đã Ngừng Hoạt Động
      </button>
    </div>

    <div class="hotel-grid">
      <div
        v-for="hotel in filteredHotels"
        :key="hotel._id"
        class="hotel-card"
        @mouseenter="hotel.showOptions = true"
        @mouseleave="hotel.showOptions = false"
        @click="navigateToHotelDetail(hotel._id)"
      >
        <img :src="hotel.IMAGES[0]" alt="hotel-image" class="hotel-image" />
        <div class="hotel-info">
          <h2 class="hotel-name">{{ hotel.NAME }}</h2>
          <div class="hotel-location">
            <span>
              {{ hotel.ADDRESS.ADDRESS_LINE }}, {{ hotel.ADDRESS.DISTRICT }},
              {{ hotel.ADDRESS.CITY }}
            </span>
          </div>
        </div>

        <div class="hotel-options" v-if="hotel.showOptions">
          <button class="edit-button" @click.stop="openEditHotelModal(hotel)">
            Chỉnh sửa
          </button>
          <button
            v-if="activeTab === 'active'"
            class="delete-button"
            @click.stop="confirmDeleteHotel(hotel._id)"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>

    <!-- Modal thêm và chỉnh sửa khách sạn -->
    <a-modal
      v-model:open="isAddHotelModalOpen"
      :title="isEditing ? 'Chỉnh sửa Khách Sạn' : 'Thêm Khách Sạn Mới'"
      @ok="addOrUpdateHotel"
      @cancel="closeModal"
      class="custom-modal"
    >
      <form @submit.prevent="addOrUpdateHotel">
        <div class="form-group">
          <label>Tên Khách Sạn:</label>
          <input v-model="newHotel.NAME" type="text" required />
        </div>

        <div class="form-group">
          <label>Địa chỉ:</label>
          <input
            v-model="newHotel.ADDRESS.ADDRESS_LINE"
            type="text"
            placeholder="Số nhà, đường"
          />
          <input
            v-model="newHotel.ADDRESS.WARD"
            type="text"
            placeholder="Phường/Xã"
          />
          <input
            v-model="newHotel.ADDRESS.DISTRICT"
            type="text"
            placeholder="Quận/Huyện"
          />
          <input
            v-model="newHotel.ADDRESS.CITY"
            type="text"
            placeholder="Tỉnh/Thành phố"
            required
          />
        </div>

        <div class="form-group">
          <label>Trạng thái:</label>
          <select v-model="newHotel.STATE">
            <option :value="true">Hoạt động</option>
            <option :value="false">Tạm ngừng</option>
          </select>
        </div>

        <div class="form-group">
          <label>Số điện thoại:</label>
          <input v-model="newHotel.PHONE" type="text" required />
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input v-model="newHotel.EMAIL" type="email" required />
        </div>

        <div class="form-group">
          <label>Mô tả:</label>
          <textarea v-model="newHotel.DESCRIPTION"></textarea>
        </div>

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
          <input
            v-model="newHotel.IMAGES[0]"
            type="url"
            placeholder="URL hình ảnh"
            required
          />
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
        </div>
      </form>
    </a-modal>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import axiosClient from "../../api/axiosClient";

export default {
  data() {
    return {
      hotels: [],
      isAddHotelModalOpen: false,
      newHotel: {
        NAME: "",
        ADDRESS: {
          ADDRESS_LINE: "",
          WARD: "",
          DISTRICT: "",
          CITY: "",
          COUNTRY: "Vietnam",
        },
        STATE: true,
        PHONE: "",
        EMAIL: "",
        DESCRIPTION: "",
        IMAGES: [""],
      },
      imageInputMethod: "url",
      selectedFile: null,
      isEditing: false,
      activeTab: "active",
    };
  },
  computed: {
    filteredHotels() {
      // Lọc danh sách khách sạn theo trạng thái
      return this.hotels.filter((hotel) => {
        return this.activeTab === "active" ? hotel.STATE : !hotel.STATE;
      });
    },
  },
  methods: {
    async fetchHotels() {
      try {
        const response = await axiosClient.get("/hotels/getAllHotels");
        this.hotels = response.data.data;
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    },
    handleFileUpload(event) {
      this.selectedFiles = event.target.files;
    },
    closeModal() {
      this.resetForm();
      this.isAddHotelModalOpen = false;
    },
    openAddHotelModal() {
      this.resetForm();
      this.isEditing = false;
      this.isAddHotelModalOpen = true;
    },
    async confirmEditHotel(hotel) {
      const result = await Swal.fire({
        title: "Bạn chắc chắn muốn chỉnh sửa khách sạn này?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Chỉnh sửa",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        this.openEditHotelModal(hotel);
      }
    },
    openEditHotelModal(hotel) {
      this.newHotel = { ...hotel };
      this.isEditing = true;
      this.isAddHotelModalOpen = true;
    },
    async confirmDeleteHotel(hotelId) {
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
          await this.deleteHotel(hotelId); // Gọi hàm deleteHotel để thực hiện xóa
          Swal.fire("Đã xóa!", "Khách sạn đã được xóa thành công.", "success");
        } catch (error) {
          // Kiểm tra lỗi từ API và thông báo quyền truy cập
          if (
            error.response &&
            error.response.data.message ===
              "Access denied. Insufficient permissions."
          ) {
            Swal.fire(
              "Thông báo",
              "Bạn không có quyền thực hiện hành động này.",
              "warning"
            );
          } else {
            Swal.fire("Lỗi", "Không thể xóa khách sạn.", "error");
          }
        }
      }
    },
    async addOrUpdateHotel() {
      try {
        const formData = new FormData();
        const isUpdate = this.isEditing;

        // Lấy dữ liệu gốc từ server nếu đang chỉnh sửa
        let originalData = {};
        if (isUpdate) {
          const response = await axiosClient.get(
            `/hotels/getHotelById/${this.newHotel._id}`
          );
          originalData = response.data.data;
        }

        // Chỉ thêm trường đã thay đổi vào formData
        if (isUpdate) {
          // Kiểm tra và thêm từng trường vào formData nếu đã thay đổi
          if (this.newHotel.NAME !== originalData.NAME) {
            formData.append("NAME", this.newHotel.NAME);
          }
          if (this.newHotel.STATE !== originalData.STATE) {
            formData.append("STATE", this.newHotel.STATE);
          }
          if (this.newHotel.PHONE !== originalData.PHONE) {
            formData.append("PHONE", this.newHotel.PHONE);
          }
          if (this.newHotel.EMAIL !== originalData.EMAIL) {
            formData.append("EMAIL", this.newHotel.EMAIL);
          }
          if (this.newHotel.DESCRIPTION !== originalData.DESCRIPTION) {
            formData.append("DESCRIPTION", this.newHotel.DESCRIPTION);
          }

          // Kiểm tra từng trường của địa chỉ
          if (
            this.newHotel.ADDRESS.ADDRESS_LINE !==
            originalData.ADDRESS.ADDRESS_LINE
          ) {
            formData.append(
              "ADDRESS[ADDRESS_LINE]",
              this.newHotel.ADDRESS.ADDRESS_LINE
            );
          }
          if (this.newHotel.ADDRESS.WARD !== originalData.ADDRESS.WARD) {
            formData.append("ADDRESS[WARD]", this.newHotel.ADDRESS.WARD);
          }
          if (
            this.newHotel.ADDRESS.DISTRICT !== originalData.ADDRESS.DISTRICT
          ) {
            formData.append(
              "ADDRESS[DISTRICT]",
              this.newHotel.ADDRESS.DISTRICT
            );
          }
          if (this.newHotel.ADDRESS.CITY !== originalData.ADDRESS.CITY) {
            formData.append("ADDRESS[CITY]", this.newHotel.ADDRESS.CITY);
          }
          if (this.newHotel.ADDRESS.COUNTRY !== originalData.ADDRESS.COUNTRY) {
            formData.append("ADDRESS[COUNTRY]", this.newHotel.ADDRESS.COUNTRY);
          }

          // Kiểm tra và thêm hình ảnh
          if (this.imageInputMethod === "url") {
            if (this.newHotel.IMAGES[0] !== originalData.IMAGES[0]) {
              formData.append("IMAGES[]", this.newHotel.IMAGES[0]); // Nếu là URL mới
            } else {
              originalData.IMAGES.forEach((img) => {
                formData.append("IMAGES[]", img); // Giữ nguyên hình ảnh hiện có
              });
            }
          } else if (this.imageInputMethod === "file" && this.selectedFiles) {
            for (let i = 0; i < this.selectedFiles.length; i++) {
              formData.append("IMAGES[]", this.selectedFiles[i]); // Thêm ảnh từ file
            }
          } else {
            // Nếu không thay đổi hình ảnh, giữ lại hình ảnh hiện có
            originalData.IMAGES.forEach((img) => {
              formData.append("IMAGES[]", img);
            });
          }
        } else {
          // Nếu thêm mới khách sạn
          formData.append("NAME", this.newHotel.NAME);
          formData.append("STATE", this.newHotel.STATE);
          formData.append("PHONE", this.newHotel.PHONE);
          formData.append("EMAIL", this.newHotel.EMAIL);
          formData.append("DESCRIPTION", this.newHotel.DESCRIPTION);
          formData.append(
            "ADDRESS[ADDRESS_LINE]",
            this.newHotel.ADDRESS.ADDRESS_LINE
          );
          formData.append("ADDRESS[WARD]", this.newHotel.ADDRESS.WARD);
          formData.append("ADDRESS[DISTRICT]", this.newHotel.ADDRESS.DISTRICT);
          formData.append("ADDRESS[CITY]", this.newHotel.ADDRESS.CITY);
          formData.append("ADDRESS[COUNTRY]", this.newHotel.ADDRESS.COUNTRY);

          if (this.imageInputMethod === "url") {
            formData.append("IMAGES[]", this.newHotel.IMAGES[0]); // Thêm URL của ảnh
          } else if (this.imageInputMethod === "file" && this.selectedFiles) {
            for (let i = 0; i < this.selectedFiles.length; i++) {
              formData.append("IMAGES[]", this.selectedFiles[i]); // Thêm ảnh từ file
            }
          }
        }

        // Gửi request API
        if (isUpdate) {
          await axiosClient.put(
            `/hotels/updateHotel/${this.newHotel._id}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          Swal.fire("Thành công", "Cập nhật khách sạn thành công.", "success");
        } else {
          const response = await axiosClient.post(
            "/hotels/createHotel",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          if (response.data.success) {
            this.hotels.push(response.data.data);
            Swal.fire(
              "Thành công",
              "Thêm mới khách sạn thành công.",
              "success"
            );
          }
        }

        await this.fetchHotels();
        this.isAddHotelModalOpen = false;
        this.resetForm();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể thêm/chỉnh sửa khách sạn.", "error");
      }
    },
    async deleteHotel(hotelId) {
      try {
        await axiosClient.post(`/hotels/deleteHotel/${hotelId}`);
        return response; // Trả về phản hồi nếu xóa thành công
      } catch (error) {
        // Ném lỗi để có thể xử lý ở nơi gọi hàm
        throw error;
      }
    },
    resetForm() {
      this.newHotel = {
        NAME: "",
        ADDRESS: {
          ADDRESS_LINE: "",
          WARD: "",
          DISTRICT: "",
          CITY: "",
          COUNTRY: "Vietnam",
        },
        STATE: true,
        PHONE: "",
        EMAIL: "",
        DESCRIPTION: "",
        IMAGES: [""],
      };
      this.selectedFiles = null;
      this.imageInputMethod = "url";
      this.isEditing = false;
    },
    navigateToHotelDetail(hotelId) {
      this.$router.push({
        name: "HotelDetailDashboard",
        params: { id: hotelId },
      });
    },
  },
  created() {
    this.fetchHotels();
  },
};
</script>

<style scoped>
.hotel-list-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  color: #6d4c41;
}

.add-hotel-button {
  background-color: #7274ff;
  color: #fff;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-hotel-button:hover {
  background-color: #5b5ed7;
}

.hotel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.hotel-card {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
  overflow: hidden;
}

.hotel-card:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.hotel-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.hotel-info {
  padding: 15px;
}

.hotel-name {
  font-size: 18px;
  font-weight: bold;
  color: #6d4c41;
  margin-bottom: 10px;
}

.hotel-description {
  font-size: 14px;
  color: #4f5a64;
  margin-bottom: 10px;
}

.hotel-location {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #7274ff;
  /* margin-bottom: 15px; */
  position: relative;
}

.hotel-card:hover .hotel-location::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -10px; /* Vị trí của đường gạch ngang */
  width: 100%;
  height: 2px; /* Độ dày của đường gạch ngang */
  background-color: #7274ff; /* Màu của đường gạch ngang */
}

.hotel-location i {
  margin-right: 8px;
}

/* Tùy chọn khi hover */
.hotel-options {
  display: flex;
  justify-content: center; /* Căn giữa theo chiều ngang */
  align-items: center; /* Căn giữa theo chiều dọc */
  gap: 10px;
}
.action-buttons {
  display: flex;
  justify-content: center; /* Căn giữa theo chiều ngang */
  align-items: center; /* Căn giữa theo chiều dọc */
  gap: 15px; /* Khoảng cách giữa hai nút */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Để căn giữa hoàn hảo */
  opacity: 0; /* Ẩn các nút khi không hover */
  transition: opacity 0.3s ease;
}

.action-buttons button {
  background-color: #f0f0f0;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 5px;
  text-decoration: underline;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.action-buttons button:hover {
  background-color: #7274ff;
  color: white;
  transform: translateY(-3px); /* Thêm hiệu ứng nhấn nút */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.hotel-card:hover .action-buttons {
  opacity: 1; /* Hiển thị các nút khi hover */
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.edit-button {
  background-color: #fff;
  color: #7274ff;
  border: 1px solid #6d4c41;
  padding: 5px 10px;
  margin: 5px 0; /* Khoảng cách giữa các nút */
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  position: relative; /* Để tạo đường gạch ngang */
  width: 100px; /* Đặt chiều rộng cho nút để có kích thước đồng đều */
}
.delete-button {
  background-color: #fff;
  color: #7274ff;
  border: 1px solid #6d4c41;
  padding: 5px 10px;
  margin: 5px 0; /* Khoảng cách giữa các nút */
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  position: relative; /* Để tạo đường gạch ngang */
  width: 100px; /* Đặt chiều rộng cho nút để có kích thước đồng đều */
}

.edit-button:hover {
  background-color: #7274ff;
  color: #fff;
}
.delete-button:hover {
  background-color: #6d4c41;
  color: #fff;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #6d4c41;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.custom-modal .ant-modal-title {
  font-size: 24px;
  font-weight: bold;
  color: #7274ff !important;
  text-align: center !important;
}

.custom-modal .ant-btn-primary {
  background-color: #7274ff; /* Đổi màu nền của nút OK */
  border-color: #7274ff; /* Màu viền của nút OK */
  color: white; /* Màu chữ của nút OK */
  font-size: 16px; /* Kích thước chữ */
}

.custom-modal .ant-btn-primary:hover {
  background-color: #5b5ed7; /* Màu khi hover */
  border-color: #5b5ed7;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.tabs button.active-tab {
  background-color: #7274ff;
  color: white;
}

.tabs button:hover {
  background-color: #5b5ed7;
  color: white;
}
</style>
