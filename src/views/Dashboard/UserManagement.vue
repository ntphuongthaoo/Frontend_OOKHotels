<template>
  <div class="user-management-container">
    <!-- <div class="header">
      <h1>Quản Lý Người Dùng</h1>
    </div> -->

    <div class="tabs">
      <button
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'; fetchUsers(selectedUserStatus)"
      >
        Người Dùng
      </button>
      <button
        :class="{ active: activeTab === 'staff' }"
        @click="activeTab = 'staff'; fetchUsers(selectedUserStatus)"
      >
        Nhân Viên
      </button>
    </div>

    <div class="search-filter-container">
      <div class="filter-container">
        <select v-model="selectedUserStatus" @change="fetchUsers(selectedUserStatus)">
          <option value="1">Chưa kích hoạt</option>
          <option value="2">Đã kích hoạt</option>
          <option value="3">Bị chặn</option>
          <option value="4">Tất cả</option>
        </select>
      </div>
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm theo họ tên, email hoặc số điện thoại"
          @input="handleSearch"
          class="search-input"
        />
      </div>
    </div>

    <table class="user-table">
      <thead>
        <tr>
          <th>Họ Tên</th>
          <th>Email</th>
          <th>Số Điện Thoại</th>
          <th>Trạng Thái</th>
          <th v-if="activeTab === 'staff'">Khách Sạn</th> <!-- Thêm cột khách sạn -->
          <th>Hành Động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user._id">
          <td>{{ user.FULLNAME }}</td>
          <td>{{ user.EMAIL }}</td>
          <td>{{ user.PHONE_NUMBER }}</td>
          <td>{{ user.IS_ACTIVATED ? 'Đã kích hoạt' : 'Chưa kích hoạt' }}</td>
          <td v-if="activeTab === 'staff'">{{ user.HOTEL_NAME || 'N/A' }}</td> <!-- Hiển thị tên khách sạn -->
          <td>
            <button 
              class="edit-button" 
              @click="toggleBlockUser(user)"
            >
              {{ user.IS_BLOCKED?.CHECK ? 'Bỏ chặn' : 'Chặn' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-changed="fetchUsers(selectedUserStatus)"
    />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import axiosClient from "../../api/axiosClient";
import Swal from "sweetalert2"; // Import SweetAlert2

export default {
  data() {
    return {
      activeTab: "users",
      selectedUserStatus: "4", // Giá trị mặc định là chưa kích hoạt
      searchQuery: "",
      users: [],
      staff: [], // Danh sách nhân viên
      totalPages: 0,
      currentPage: 1,
    };
  },
  computed: {
    filteredUsers() {
      const allUsers = this.activeTab === 'users' ? this.users : this.staff;
      return allUsers.filter(user => {
        const query = this.searchQuery.toLowerCase();
        return (
          user.FULLNAME.toLowerCase().includes(query) ||
          user.EMAIL.toLowerCase().includes(query) ||
          user.PHONE_NUMBER.toLowerCase().includes(query)
        );
      });
    },
  },
  methods: {
    ...mapActions(["fetchUsers"]),
    handleSearch() {
      this.fetchUsers(this.selectedUserStatus);
    },
    async fetchUsers(status) {
      try {
        const response = await axiosClient.get("/users/getUsers", {
          params: {
            tabStatus: status,
            page: this.currentPage,
            limit: 10, // Hoặc số giới hạn mà bạn muốn
          },
        });

        // Phân loại người dùng
        this.users = response.data.data.filter(user => !user.HOTEL_ID);
        this.staff = response.data.data.filter(user => user.HOTEL_ID && (user.ROLE.STAFF || user.ROLE.BRANCH_MANAGER));

        // Gán tên khách sạn cho nhân viên
        this.staff.forEach(user => {
          user.HOTEL_NAME = user.HOTEL_ID ? user.hotel.NAME.split("ETHEREAL ")[1] || 'N/A' : 'N/A';
        });

        this.totalPages = response.data.totalPages;
      } catch (error) {
        console.error("Lỗi khi lấy người dùng:", error);
      }
    },
    async toggleBlockUser(user) {
      const isBlocked = !user.IS_BLOCKED?.CHECK; // Đảo ngược trạng thái chặn

      // Hiển thị hộp thoại xác nhận trước khi thực hiện hành động
      const result = await Swal.fire({
        title: isBlocked ? "Bạn có chắc chắn muốn chặn người dùng này không?" : "Bạn có chắc chắn muốn bỏ chặn người dùng này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: isBlocked ? "Chặn" : "Bỏ chặn",
        cancelButtonText: "Hủy",
        confirmButtonColor: isBlocked ? "#d33" : "#4CAF50",
      });

      // Nếu người dùng xác nhận, thực hiện hành động chặn hoặc bỏ chặn
      if (result.isConfirmed) {
        try {
          await axiosClient.post('/users/blockUser', {
            IS_BLOCKED: isBlocked,
            userId: user._id,
          });

          // Cập nhật lại danh sách người dùng sau khi chặn hoặc bỏ chặn
          await this.fetchUsers(this.selectedUserStatus);
          // Hiển thị thông báo thành công
          this.$message.success(`Đã ${isBlocked ? 'chặn' : 'bỏ chặn'} người dùng thành công!`);
        } catch (error) {
          console.error("Lỗi khi chặn/bỏ chặn người dùng:", error);
          this.$message.error("Có lỗi xảy ra, không thể thực hiện hành động!");
        }
      }
    },
  },
  mounted() {
    this.fetchUsers(this.selectedUserStatus);
  },
};
</script>

<style scoped>
.user-management-container {
  padding: 20px;
  background-color: #f5f5f5; /* Màu nền trang */
}

.header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  color: #6d4c41; /* Màu chữ tiêu đề */
}

.tabs {
  display: flex;
  margin-bottom: 20px;

  button {
    flex: 1;
    padding: 10px;
    background-color: #e0e0e0; /* Màu nền cho tab */
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;

    &.active {
      background-color: #7274ff; /* Màu nền cho tab đang hoạt động */
      color: white;
    }

    &:hover {
      background-color: #d1d1d1; /* Màu nền khi hover */
    }
  }
}

.search-filter-container {
  display: flex;
  justify-content: space-between; /* Căn giữa hai phần */
  margin-bottom: 20px;
}

.search-container {
  flex: 1; /* Để thanh tìm kiếm chiếm không gian còn lại */
  margin-right: 10px; /* Khoảng cách giữa thanh tìm kiếm và thanh lọc */
}

.search-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  width: 70%; /* Chiếm toàn bộ chiều ngang */
  margin-left: 10px;

  &:focus {
    border-color: #7274ff;
    outline: none; /* Loại bỏ outline mặc định */
  }
}

.filter-container {
  display: flex;
  align-items: center; /* Căn giữa theo chiều dọc */
}

.filter-container select {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    border-color: #7274ff;
    outline: none; /* Loại bỏ outline mặc định */
  }
}

.user-table {
  width: 100%;
  border-collapse: collapse; /* Để không có khoảng cách giữa các ô */
  margin-top: 20px; /* Khoảng cách giữa thanh tìm kiếm và bảng */
}

.user-table th,
.user-table td {
  padding: 10px;
  border: 1px solid #ccc; /* Đường viền của bảng */
  text-align: left; /* Canh trái cho các ô */
}

.user-table th {
  background-color: #e0e0e0; /* Màu nền cho header */
  color: #6d4c41; /* Màu chữ cho header */
}

.edit-button {
  background-color: #7274ff; /* Nút chỉnh sửa */
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #5b5ed7; /* Màu nền khi hover */
  }
}
</style>
