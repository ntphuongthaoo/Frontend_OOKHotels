<template>
  <AdminLayout>
    <!-- Card Tổng Doanh Thu nằm riêng ở trên cùng -->
    <section class="total-revenue-section">
      <div class="stat-card total-revenue-card">
        <h3>Tổng Doanh Thu</h3>
        <p>{{ formattedTotalRevenue }}</p>
      </div>
    </section>

    <!-- Card Doanh thu từng khách sạn -->
    <section class="hotel-revenue-section">
      <div
        v-for="hotel in hotelRevenues"
        :key="hotel.hotel"
        class="stat-card hotel-revenue-card"
      >
        <h3>{{ hotel.hotelName }}</h3>
        <p>{{ formatCurrency(hotel.revenue[currentMonth - 1]) }}</p>
      </div>
    </section>
  </AdminLayout>
</template>

<script>
import axiosClient from "../../api/axiosClient";

export default {
  name: "RevenueOverview",
  data() {
    return {
      totalRevenue: 0,
      hotelRevenues: [],
      currentMonth: new Date().getMonth() + 1, // Tháng hiện tại
    };
  },
  computed: {
    formattedTotalRevenue() {
      return this.formatCurrency(this.totalRevenue);
    },
  },
  methods: {
    formatCurrency(value) {
      if (!value) return "0 VND";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
      }).format(value);
    },
    async fetchRevenueData() {
      try {
        const response = await axiosClient.get("/bookings/getMonthlyRevenue", {
          params: { year: new Date().getFullYear() },
        });

        if (response.data) {
          this.totalRevenue = response.data.totalRevenue || 0;
          this.hotelRevenues = response.data.hotelRevenues || [];
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
      }
    },
  },
  mounted() {
    this.fetchRevenueData();
  },
};
</script>

<style scoped>
.total-revenue-section {
  margin: 40px 40px 20px;
}

.total-revenue-card {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  border-left: 5px solid #4caf50; /* Màu viền xanh cho tổng doanh thu */
}

.hotel-revenue-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  padding: 0 40px;
}

.stat-card {
  background-color: #fff;
  padding: 30px;
  flex: 1 1 calc(33.333% - 20px); /* Để chia đều không gian cho 3 card */
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  border-left: 5px solid #ff9800; /* Màu viền cam cho khách sạn */
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
