<template>
  <div class="admin-layout">
    <Sidebar :activePage="activePage" @navigate="navigate" />
    <div class="main-content">
      <Header :title="pageTitle" />
      <slot></slot>
    </div>
  </div>
</template>

<script>
import Header from "../../components/HeaderAdmin/Header.vue";
import Sidebar from "../../components/SideBarAdmin/SidebaAdmin.vue";

export default {
  name: "AdminLayout",
  components: {
    Header,
    Sidebar,
  },
  data() {
    return {
      activePage: "dashboard",
      pageTitle: "Quản Lý Chuỗi Khách Sạn",
    };
  },
  methods: {
    navigate(page) {
      this.activePage = page;
      this.pageTitle = this.getPageTitle(page);
    },
    getPageTitle(page) {
      switch (page) {
        case "hotels":
          return "Quản lý khách sạn";
        case "bookings":
          return "Quản lý đặt phòng";
        case "revenue":
          return "Quản lý doanh thu";
        case "users":
          return "Quản lý người dùng";
        case "reviews":
          return "Quản lý đánh giá";
        case "vouchers":
          return "Quản lý khuyến mãi";
        default:
          return "Dashboard quản lý";
      }
    },
  },
};
</script>

<style scoped>
/* Bố cục chung */
.admin-layout {
  display: flex;
}

/* Nội dung chính */
.main-content {
  margin-left: 260px; /* Đặt khoảng cách giữa Sidebar và Main content */
  padding: 20px;
  width: calc(100% - 260px); /* Chiều rộng chiếm phần còn lại */
  background-color: #f5f5f5; /* Nền sáng cho nội dung chính */
  min-height: 100vh;
  box-sizing: border-box;
}

.main-content h1 {
  font-size: 22px; /* Giảm kích thước chữ */
  font-weight: bold;
  color: #7274ff;
  margin-bottom: 20px; /* Khoảng cách dưới để cách biệt nội dung */
}

/* Phần chứa nội dung của từng trang */
.page-content {
  margin-top: 80px; /* Khoảng cách giữa Header và nội dung trang */
}
</style>
