<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-header">
      <h2>OOK</h2>
    </div>

    <!-- Danh sách điều hướng -->
    <nav>
      <ul>
        <li
          :class="{ active: activePage === 'dashboard' }"
          @click="navigate('dashboard')"
        >
          <i class="fas fa-tachometer-alt"></i>
          <span>Tổng quan</span>
        </li>

        <li
          :class="{ active: activePage === 'hotels' }"
          @click="navigate('hotels')"
        >
          <i class="fas fa-hotel"></i>
          <span>Khách Sạn</span>
        </li>

        <li
          :class="{ active: activePage === 'bookings' }"
          @click="navigate('bookings')"
        >
          <i class="fas fa-book"></i>
          <span>Đặt Phòng</span>
        </li>

        <li
          :class="{ active: activePage === 'revenue' }"
          @click="navigate('revenue')"
        >
          <i class="fas fa-chart-line"></i>
          <span>Doanh Thu</span>
        </li>

        <li
          :class="{ active: activePage === 'users' }"
          @click="navigate('users')"
        >
          <i class="fas fa-users"></i>
          <span>Người Dùng</span>
        </li>
        <li
          :class="{ active: activePage === 'reviews' }"
          @click="navigate('reviews')"
        >
          <i class="fa fa-star" aria-hidden="true"></i>
          <span>Đánh giá</span>
        </li>
        <li
          :class="{ active: activePage === 'vouchers' }"
          @click="navigate('vouchers')"
        >
          <i class="fas fa-ticket-alt"></i>
          <span>Khuyến mãi</span>
        </li>

        <li
          :class="{ active: activePage === 'chats' }"
          @click="navigate('chats')"
        >
          <i class="fa fa-comments" aria-hidden="true"></i>
          <span>CSKH</span>
        </li>

        <li class="logout" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
          <span>Đăng Xuất</span>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "Sidebar",
  props: {
    activePage: {
      type: String,
      default: "dashboard",
    },
  },
  mounted() {
    // Lấy trang hoạt động từ localStorage
    const storedPage = localStorage.getItem("activePage");
    if (storedPage) {
      this.$emit("navigate", storedPage); // Emit để điều hướng nếu có trang lưu trữ
    }
  },
  methods: {
    ...mapActions(["logout"]),
    navigate(page) {
      this.$emit("navigate", page); // Emit sự kiện để điều hướng
      this.$router.push({ name: page }); // Điều hướng router
      localStorage.setItem("activePage", page); // Lưu trang đang hoạt động vào localStorage
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #f0f2f5; /* Nền màu xám sáng */
  color: #7274ff; /* Màu chữ chính */
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}

.sidebar-header {
  padding: 30px 20px;
  background-color: #e8e9ff; /* Màu nền nhạt với sắc xanh nhẹ */
  text-align: center;
  font-weight: bold;
  font-size: 24px;
  color: #7274ff;
  border-bottom: 1px solid #d3d4e5;
}

.sidebar-header h2 {
  margin: 0;
  font-family: "Poppins", sans-serif;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.sidebar nav ul li {
  padding: 15px 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #7274ff;
  font-size: 16px;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.sidebar nav ul li:hover {
  color: #ffffff; /* Màu chữ khi hover */
  background-color: #7274ff; /* Màu nền khi hover */
  border-left: 4px solid #ffffff; /* Đường viền trái trắng khi hover */
}

.sidebar nav ul li.active {
  color: #ffffff; /* Màu chữ cho item đang hoạt động */
  background-color: #898add; /* Nền chính khi active */
  font-weight: bold;
  border-left: 4px solid #ffffff; /* Đường viền trái trắng */
}

.sidebar nav ul li i {
  margin-right: 15px; /* Khoảng cách giữa icon và text */
  font-size: 18px;
}

.sidebar nav ul li span {
  display: inline-block;
  font-size: 18px;
  margin-left: 5px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .sidebar nav ul li {
    font-size: 14px;
    padding: 12px 20px;
  }

  .sidebar-header h2 {
    font-size: 20px;
  }
}
</style>
