<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>OOK</h2>
    </div>
    <nav>
      <ul>
        <li :class="{ active: activePage === 'dashboard' }" @click="navigate('dashboard')">
          <i class="fas fa-tachometer-alt"></i> Dashboard
        </li>
        <li :class="{ active: activePage === 'hotels' }" @click="navigate('hotels')">
          <i class="fas fa-hotel"></i> Khách Sạn
        </li>
        <li :class="{ active: activePage === 'bookings' }" @click="navigate('bookings')">
          <i class="fas fa-book"></i> Đặt Phòng
        </li>
        <li :class="{ active: activePage === 'revenue' }" @click="navigate('revenue')">
          <i class="fas fa-chart-line"></i> Doanh Thu
        </li>
        <li :class="{ active: activePage === 'users' }" @click="navigate('users')">
          <i class="fas fa-users"></i> Người Dùng
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: "Sidebar",
  props: {
    activePage: {
      type: String,
      default: "dashboard",
    },
  },
  methods: {
    navigate(page) {
      switch (page) {
        case 'hotels':
          this.$router.push({ name: 'hotels' }); // Điều hướng đến trang quản lý khách sạn
          break;
        case 'dashboard':
          this.$router.push({ name: 'dashboard' });
          break;
        // Thêm các trường hợp khác tương tự nếu cần
        default:
          break;
      }
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #fff;
  color: #4F5A64;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px;
  background-color: #fff;
  text-align: center;
}

.sidebar-header h2 {
  color: #7274FF;
  margin: 0;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

/* Các thẻ li mặc định có màu xám */
.sidebar nav ul li {
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #4F5A64;
  transition: color 0.3s ease, background-color 0.3s ease;
}

/* Khi hover thay đổi màu sang #7274FF */
.sidebar nav ul li:hover {
  color: #7274FF;
  background-color: #f0f0f0;
}

/* Khi được chọn (active), thay đổi màu sang #7274FF */
.sidebar nav ul li.active {
  color: #7274FF;
  background-color: #e8e8ff; /* Nhạt hơn một chút so với màu chính */
  font-weight: bold;
}

/* Icon bên trái các thẻ li */
.sidebar nav ul li i {
  margin-right: 10px;
}
</style>
