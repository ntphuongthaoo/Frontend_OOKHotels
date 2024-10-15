<template>
  <AdminLayout>
    <section class="dashboard-overview">
      <div class="stat-card">
        <h3>Tổng Doanh Thu</h3>
        <p>{{ totalRevenue.toLocaleString() }} VND</p>
      </div>
      <div class="stat-card">
        <h3>Phòng Đang Đặt</h3>
        <p>{{ totalBookings }} phòng</p>
      </div>
      <div class="stat-card">
        <h3>Khách Sạn Hoạt Động</h3>
        <p>{{ activeHotels }} khách sạn</p>
      </div>
    </section>
  </AdminLayout>
</template>

<script>
export default {
  data() {
    return {
      totalRevenue: 125000000,
      totalBookings: 120,
      activeHotels: 25,
    };
  },
};
</script>

<style scoped>
.dashboard-overview {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  gap: 20px;
  padding: 0 40px;
}

.stat-card {
  background-color: #fff;
  padding: 30px;
  flex: 1;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  border-left: 5px solid #7274FF;
}

.stat-card:hover {
  transform: translateY(-10px);
}

.stat-card h3 {
  color: #7274FF;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 15px;
  text-transform: uppercase;
}

.stat-card p {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}
</style>
