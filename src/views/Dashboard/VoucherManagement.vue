<template>
  <div class="voucher-management">
    <div class="header">
      <button class="btn-primary" @click="openCreateModal">
        + Thêm Voucher
      </button>
    </div>

    <table class="voucher-table">
      <thead>
        <tr>
          <th>Mã Voucher</th>
          <th>Giảm giá (%)</th>
          <th>Ngày hết hạn</th>
          <th>Khách sạn áp dụng</th>
          <th>Số đêm tối thiểu</th>
          <th>Giá trị tối thiểu</th>
          <th>Số lần sử dụng</th>
          <th>Tối đa</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="voucher in filteredVouchers" :key="voucher._id">
          <td>{{ voucher.CODE }}</td>
          <td>{{ voucher.DISCOUNT_PERCENTAGE }}</td>
          <td>{{ new Date(voucher.EXPIRATION_DATE).toLocaleDateString() }}</td>
          <td>
            <ul>
              <li v-for="hotel in voucher.APPLICABLE_HOTELS" :key="hotel._id">
                {{ hotel.NAME }}
              </li>
            </ul>
          </td>
          <td>{{ voucher.MIN_NIGHTS || "Không áp dụng" }}</td>
          <td>{{ voucher.MIN_TOTAL_AMOUNT || "Không áp dụng" }}</td>
          <td>{{ voucher.USAGE_COUNT }}</td>
          <td>{{ voucher.MAX_USAGE || "Không giới hạn" }}</td>
          <td>
            <span
              :class="voucher.IS_ACTIVE ? 'status-active' : 'status-inactive'"
            >
              {{ voucher.IS_ACTIVE ? "Hoạt động" : "Không hoạt động" }}
            </span>
          </td>
          <td>
            <button class="btn-edit" @click="openEditModal(voucher)">
              Sửa
            </button>
            <button class="btn-delete" @click="deleteVoucher(voucher._id)">
              Xóa
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal thêm/sửa voucher -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ isEdit ? "Cập nhật Voucher" : "Thêm Voucher" }}</h3>
        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-grid">
            <!-- Cột 1 -->
            <div class="form-column">
              <div class="form-group">
                <label for="voucher-code">Mã Voucher</label>
                <input
                  id="voucher-code"
                  v-model="currentVoucher.CODE"
                  placeholder="Nhập mã voucher"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="discount-percentage">Giảm giá (%)</label>
                <input
                  id="discount-percentage"
                  type="number"
                  v-model="currentVoucher.DISCOUNT_PERCENTAGE"
                  placeholder="Nhập phần trăm giảm giá"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="min-nights">Số đêm tối thiểu</label>
                <input
                  id="min-nights"
                  type="number"
                  v-model="currentVoucher.MIN_NIGHTS"
                  placeholder="Không bắt buộc"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="room-types">Loại phòng áp dụng</label>
                <input
                  id="room-types"
                  v-model="currentVoucher.ROOM_TYPES"
                  placeholder="Nhập các loại phòng, phân cách bằng dấu phẩy"
                  class="form-input"
                />
              </div>
            </div>

            <!-- Cột 2 -->
            <div class="form-column">
              <div class="form-group">
                <label for="expiration-date">Ngày hết hạn</label>
                <input
                  id="expiration-date"
                  type="date"
                  v-model="currentVoucher.EXPIRATION_DATE"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="min-total">Giá trị tối thiểu (VNĐ)</label>
                <input
                  id="min-total"
                  type="number"
                  v-model="currentVoucher.MIN_TOTAL_AMOUNT"
                  placeholder="Không bắt buộc"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="max-usage">Số lần sử dụng tối đa</label>
                <input
                  id="max-usage"
                  type="number"
                  v-model="currentVoucher.MAX_USAGE"
                  placeholder="Không bắt buộc"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="status">Trạng thái</label>
                <select
                  id="status"
                  v-model="currentVoucher.IS_ACTIVE"
                  class="form-input"
                >
                  <option :value="true">Hoạt động</option>
                  <option :value="false">Không hoạt động</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Danh sách khách sạn áp dụng -->
          <div class="form-group">
            <label class="form-label">Khách sạn áp dụng</label>
            <div class="checkbox-list">
              <div
                v-for="hotel in hotels"
                :key="hotel._id"
                class="checkbox-item"
              >
                <input
                  type="checkbox"
                  :id="hotel._id"
                  :value="hotel._id"
                  v-model="currentVoucher.APPLICABLE_HOTELS"
                  class="checkbox-input"
                />
                <label :for="hotel._id" class="checkbox-label">
                  {{ hotel.NAME }}
                </label>
              </div>
            </div>
          </div>

          <!-- Nút hành động -->
          <div class="modal-actions">
            <button type="submit" class="btn-primary">
              {{ isEdit ? "Cập nhật" : "Thêm" }}
            </button>
            <button type="button" class="btn-secondary" @click="closeModal">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";
import Swal from "sweetalert2";

export default {
  name: "VoucherManagement",
  data() {
    return {
      vouchers: [],
      hotels: [], // Danh sách khách sạn
      searchText: "",
      showModal: false,
      isEdit: false,
      currentVoucher: {
        CODE: "",
        DISCOUNT_PERCENTAGE: 0,
        MIN_NIGHTS: null,
        MIN_TOTAL_AMOUNT: null,
        ROOM_TYPES: "",
        APPLICABLE_HOTELS: [], // Lưu danh sách ID khách sạn
        EXPIRATION_DATE: "",
        MAX_USAGE: null,
        IS_ACTIVE: true,
      },
    };
  },
  computed: {
    filteredVouchers() {
      return this.vouchers.filter((voucher) =>
        voucher.CODE.toLowerCase().includes(this.searchText.toLowerCase())
      );
    },
  },
  methods: {
    async fetchVouchers() {
      try {
        const response = await axiosClient.get("/vouchers/getAllVouchers");
        this.vouchers = response.data;
      } catch (error) {
        console.error("Lỗi khi tải voucher:", error);
      }
    },
    async fetchHotels() {
      try {
        const response = await axiosClient.get("/hotels/getAllHotels"); // API trả danh sách khách sạn
        this.hotels = response.data.data;
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách sạn:", error);
      }
    },
    openCreateModal() {
      this.isEdit = false;
      this.resetCurrentVoucher();
      this.showModal = true;
    },
    openEditModal(voucher) {
      this.isEdit = true;
      this.currentVoucher = {
        ...voucher,
        EXPIRATION_DATE: new Date(voucher.EXPIRATION_DATE)
          .toISOString()
          .split("T")[0], // Định dạng ngày
        APPLICABLE_HOTELS: voucher.APPLICABLE_HOTELS.map((hotel) => hotel._id), // Chỉ lấy ID khách sạn
      };
      this.showModal = true;
    },
    resetCurrentVoucher() {
      this.currentVoucher = {
        CODE: "",
        DISCOUNT_PERCENTAGE: 0,
        MIN_NIGHTS: null,
        MIN_TOTAL_AMOUNT: null,
        ROOM_TYPES: "",
        APPLICABLE_HOTELS: [],
        EXPIRATION_DATE: "",
        MAX_USAGE: null,
        IS_ACTIVE: true,
      };
    },
    closeModal() {
      this.showModal = false;
      this.resetCurrentVoucher();
    },
    async handleSubmit() {
      try {
        if (this.isEdit) {
          await axiosClient.put(
            `/vouchers/updateVoucher/${this.currentVoucher._id}`,
            this.currentVoucher
          );
          Swal.fire({
            icon: "success",
            title: "Cập nhật thành công",
            text: "Voucher đã được cập nhật.",
          });
        } else {
          await axiosClient.post(
            "/vouchers/createVoucher",
            this.currentVoucher
          );
          Swal.fire({
            icon: "success",
            title: "Thêm thành công",
            text: "Voucher mới đã được tạo.",
          });
        }
        this.closeModal();
        this.fetchVouchers();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Đã xảy ra lỗi khi xử lý voucher.",
        });
        console.error("Lỗi khi xử lý voucher:", error);
      }
    },
    async deleteVoucher(id) {
      Swal.fire({
        title: "Bạn có chắc chắn?",
        text: "Voucher này sẽ bị xóa và không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axiosClient.delete(`/vouchers/deleteVoucher/${id}`);
            Swal.fire({
              icon: "success",
              title: "Xóa thành công",
              text: "Voucher đã được xóa.",
            });
            this.fetchVouchers();
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Lỗi",
              text: "Đã xảy ra lỗi khi xóa voucher.",
            });
            console.error("Lỗi khi xóa voucher:", error);
          }
        }
      });
    },
  },
  mounted() {
    this.fetchVouchers();
    this.fetchHotels();
  },
};
</script>

<style scoped>
.voucher-management {
  padding: 20px;
  background-color: #f9f9f9;
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
}

.btn-primary {
  background-color: #7274ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 20px;
}

.btn-secondary {
  background-color: #e4e4e4;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.search-bar {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.voucher-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  margin-bottom: 20px;
}

.voucher-table th,
.voucher-table td {
  padding: 10px 15px;
  text-align: left;
  border: 1px solid #ddd;
}

.voucher-table th {
  background-color: #f4f4f4;
  text-align: center;
}

.status-active {
  color: green;
  font-weight: bold;
}

.status-inactive {
  color: red;
  font-weight: bold;
}

.btn-edit {
  background-color: #f0ad4e;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin-bottom: 5px;
}

.btn-delete {
  background-color: #d9534f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

h3 {
  text-align: center;
  color: #7274ff;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  justify-content: end;
  margin-top: 20px;
}

.btn-primary {
  background-color: #7274ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #e4e4e4;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
  color: #333;
}

.checkbox-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px; /* Khoảng cách giữa các checkbox */
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
  max-height: 200px; /* Giới hạn chiều cao */
  overflow-y: auto; /* Cuộn nếu danh sách quá dài */
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.checkbox-item:hover {
  background-color: #f4f4f4;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
}

.checkbox-input {
  display: none; /* Ẩn checkbox gốc */
}

.checkbox-label {
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.checkbox-input:checked + .checkbox-label {
  color: #7274ff; /* Màu chữ khi được chọn */
  font-weight: bold;
}

.checkbox-item input[type="checkbox"]:checked + .checkbox-label {
  color: #7274ff; /* Màu khi checkbox được chọn */
  font-weight: bold;
}

.checkbox-item input[type="checkbox"]:checked + .checkbox-label::before {
  content: "✔ ";
  color: #7274ff; /* Biểu tượng check khi được chọn */
}
</style>
