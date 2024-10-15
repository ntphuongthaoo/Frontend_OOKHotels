<template>
  <header class="header">
    <div class="header-left">
      <h1>{{ title }}</h1>
    </div>
    <div class="header-right">
      <input type="text" placeholder="Tìm kiếm..." />
      <div class="user-info">
        <span>Xin chào, Admin</span>
        <img src="../../assets/avatar.jpg" alt="Avatar" />
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  props: {
    title: {
      type: String,
      default: "Dashboard Quản Lý",
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  color: #7274FF;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative; /* Không sử dụng fixed */
  top: 0;
  left: 0;
  width: 100%; /* Chỉ chiếm toàn bộ chiều ngang trong main-content */
  border-radius: 5px;
}

.header-left h1 {
  margin: 0;
  font-size: 25px;
  padding: 10px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-right input {
  padding: 8px;
  border: none;
  border-radius: 4px;
  margin-right: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-right .user-info {
  display: flex;
  align-items: center;
}

.header-right .user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 10px;
}
</style>
