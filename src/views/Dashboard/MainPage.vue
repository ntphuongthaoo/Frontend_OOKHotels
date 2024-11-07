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

    <!-- Bộ lọc thời gian và khách sạn -->
    <section class="filter-section">
      <div class="filter-group">
        <label for="timeFrame">Bộ lọc thời gian:</label>
        <select
          class="filter-select"
          v-model="timeFrame"
          @change="fetchDataForCharts"
        >
          <option value="day">Theo ngày</option>
          <option value="month">Theo tháng</option>
          <option value="year">Theo năm</option>
        </select>
      </div>
      <div class="filter-group" v-if="timeFrame === 'day'">
        <label for="selectedDate">Chọn ngày:</label>
        <input
          type="date"
          v-model="selectedDate"
          class="filter-input"
          @change="handleDateChange"
        />
      </div>
      <div class="filter-group" v-if="timeFrame === 'month'">
        <label for="selectedMonth">Chọn tháng:</label>
        <input
          type="month"
          v-model="selectedMonth"
          class="filter-input"
          @change="handleMonthChange"
        />
      </div>
      <div class="filter-group" v-if="timeFrame === 'year'">
        <label for="selectedYear">Chọn năm:</label>
        <input
          type="number"
          placeholder="Nhập năm"
          v-model="year"
          class="filter-input"
          @change="fetchDataForCharts"
        />
      </div>
      <div class="filter-group">
        <label for="hotelFilter">Chọn khách sạn:</label>
        <select
          class="filter-select"
          v-model="selectedHotel"
          @change="fetchDataForCharts"
        >
          <option value="">Tất cả khách sạn</option>
          <option v-for="hotel in hotels" :key="hotel._id" :value="hotel._id">
            {{ hotel.NAME }}
          </option>
        </select>
      </div>
    </section>

    <!-- Biểu đồ doanh thu -->
    <div class="charts-container">
      <section class="chart-section">
        <canvas id="revenueChart"></canvas>
      </section>
      <section class="chart-section">
        <canvas id="bookingStatusChart"></canvas>
      </section>
    </div>
  </AdminLayout>
</template>

<script>
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import axiosClient from "../../api/axiosClient";

// Đăng ký các thành phần cần thiết cho biểu đồ đường
ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default {
  data() {
    return {
      totalRevenue: 0,
      totalBookings: 120,
      activeHotels: 25,
      timeFrame: "month",
      year: new Date().getFullYear(),
      selectedDate: "",
      selectedMonth: "",
      selectedMonthOnly: "",
      selectedYear: "",
      revenueData: [],
      chart: null,
      selectedHotel: "",
      hotels: [],
      bookingStatusData: [],
      bookingStatusChart: null,
    };
  },
  mounted() {
    this.fetchHotels();
    this.fetchDataForCharts();
  },
  methods: {
    handleDateChange() {
      const dateParts = this.selectedDate.split("-"); // Tách thành năm, tháng, ngày
      this.selectedYear = dateParts[0]; // Năm
      this.selectedMonthOnly = dateParts[1]; // Tháng
      this.selectedDay = dateParts[2]; // Ngày
      this.fetchDataForCharts(); // Gọi lại để lấy dữ liệu
    },
    handleMonthChange() {
      const [year, month] = this.selectedMonth.split("-");
      this.selectedYear = year; // Cập nhật selectedYear
      this.selectedMonthOnly = month; // Lưu chỉ tháng vào selectedMonthOnly
      this.fetchDataForCharts(); // Gọi lại để lấy dữ liệu
    },

    async fetchHotels() {
      try {
        const response = await axiosClient.get("/hotels/getAllHotels");
        this.hotels = response.data.data; // Đảm bảo lấy đúng mảng `data`
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khách sạn:", error);
      }
    },
    async fetchDataForCharts() {
      await this.fetchRevenueData();
      await this.fetchBookingStatusData();
    },
    async fetchBookingStatusData() {
      try {
        const params = {
          timeFrame: this.timeFrame,
          selectedDate: this.timeFrame === "day" ? this.selectedDay : undefined,
          selectedMonth: this.timeFrame === "day" ? this.selectedMonthOnly : this.timeFrame === "month" ? this.selectedMonthOnly : undefined,
          selectedYear: this.selectedYear || this.year,
          hotelId: this.selectedHotel || undefined,
        };

        const response = await axiosClient.get(
          "/bookings/getBookingStatusData",
          { params }
        );
        this.bookingStatusData = response.data.data;
        this.updateBookingStatusChart();
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu trạng thái đặt phòng:", error);
      }
    },
    async fetchRevenueData() {
      try {
        const params = {
          timeFrame: this.timeFrame,
          selectedDate: this.timeFrame === "day" ? this.selectedDay : undefined,
          selectedMonth: this.timeFrame === "day" ? this.selectedMonthOnly : this.timeFrame === "month" ? this.selectedMonthOnly : undefined,
          selectedYear: this.selectedYear || this.year,
          hotelId: this.selectedHotel || undefined,
        };

        console.log("Payload:", params);

        // Gọi API sử dụng axiosClient
        const response = await axiosClient.get("/bookings/getRevenue", {
          params,
        });
        const data = response.data;

        // Cập nhật dữ liệu doanh thu dựa trên timeFrame
        this.revenueData =
          this.timeFrame === "day"
            ? data.dailyRevenue
            : this.timeFrame === "month"
            ? data.monthlyRevenue
            : data.yearlyRevenue;
        this.totalRevenue = data.totalRevenue;

        this.updateChart();
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
      }
    },
    updateChart() {
      if (this.chart) this.chart.destroy();

      const canvas = document.getElementById("revenueChart");
      const ctx = canvas.getContext("2d");

      this.chart = new ChartJS(ctx, {
        type: "line",
        data: {
          labels: this.generateLabels(),
          datasets: [
            {
              label: "Doanh thu (VND)",
              data: Object.values(this.revenueData),
              borderColor: "#7274FF",
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  // Tránh lỗi khi chartArea chưa sẵn sàng
                  return null;
                }
                const gradient = ctx.createLinearGradient(
                  0,
                  chartArea.top,
                  0,
                  chartArea.bottom
                );
                gradient.addColorStop(0, "rgba(114, 116, 255, 0.6)");
                gradient.addColorStop(1, "rgba(114, 116, 255, 0)");
                return gradient;
              },
              fill: true,
              pointBackgroundColor: "#7274FF",
              pointBorderColor: "#7274FF",
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: "Tổng số tiền (VND)",
              },
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return value.toLocaleString();
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: {
                usePointStyle: true,
                pointStyleWidth: 1,
                font: {
                  size: 12,
                  weight: "bold",
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `${
                    tooltipItem.dataset.label
                  }: ${tooltipItem.raw.toLocaleString()} VND`;
                },
              },
            },
          },
        },
      });
    },

    updateBookingStatusChart() {
      if (this.bookingStatusChart) this.bookingStatusChart.destroy();

      const ctx = document
        .getElementById("bookingStatusChart")
        .getContext("2d");

      // Tạo gradient cho đường "Đặt phòng thành công"
      const successGradient = ctx.createLinearGradient(0, 0, 0, 400);
      successGradient.addColorStop(0, "rgba(76, 175, 80, 0.4)"); // Màu xanh lá nhạt phía trên
      successGradient.addColorStop(1, "rgba(76, 175, 80, 0)"); // Trong suốt phía dưới

      // Tạo gradient cho đường "Phòng bị hủy"
      const cancelGradient = ctx.createLinearGradient(0, 0, 0, 400);
      cancelGradient.addColorStop(0, "rgba(255, 82, 82, 0.4)"); // Màu đỏ nhạt phía trên
      cancelGradient.addColorStop(1, "rgba(255, 82, 82, 0)"); // Trong suốt phía dưới

      this.bookingStatusChart = new ChartJS(ctx, {
        type: "line",
        data: {
          labels: this.bookingStatusData.map((item) => item._id),
          datasets: [
            {
              label: "Đặt phòng thành công",
              data: this.bookingStatusData.map((item) => item.successfulCount),
              borderColor: "#4CAF50",
              backgroundColor: successGradient,
              fill: true,
              pointBackgroundColor: "#4CAF50",
              pointBorderColor: "#4CAF50",
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.3, // Tạo độ cong cho đường
            },
            {
              label: "Phòng bị hủy",
              data: this.bookingStatusData.map((item) => item.canceledCount),
              borderColor: "#FF5252",
              backgroundColor: cancelGradient,
              fill: true,
              pointBackgroundColor: "#FF5252",
              pointBorderColor: "#FF5252",
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.3, // Tạo độ cong cho đường
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            
            y: {
              title: {
                display: true,
                text: "Lượt đặt phòng",   
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                callback: function (value) {
                  return value.toLocaleString(); // Hiển thị số liệu có dấu phân cách
                },
              },
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
                lineWidth: 0.5,
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: {
                font: {
                  size: 12,
                  weight: "bold",
                },
                usePointStyle: true, // Sử dụng kiểu chấm tròn thay vì hình chữ nhật
              },
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `${
                    tooltipItem.dataset.label
                  }: ${tooltipItem.raw.toLocaleString()} phòng`;
                },
              },
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              titleFont: { size: 13, weight: "bold" },
              bodyFont: { size: 12 },
              padding: 10,
            },
          },
        },
      });
    },

    generateLabels() {
      if (this.timeFrame === "day") {
        return Object.keys(this.revenueData).sort(
          (a, b) => new Date(a) - new Date(b)
        ); // Sắp xếp theo thứ tự
      }
      if (this.timeFrame === "month")
        return [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12",
        ];
      if (this.timeFrame === "year") return [`Năm ${this.year}`];
    },
  },
};
</script>

<style scoped>

.chart-section {
  margin-top: 20px;
  padding: 0 40px;
}

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
  border-left: 5px solid #7274ff;
}

.stat-card:hover {
  transform: translateY(-10px);
}

.stat-card h3 {
  color: #7274ff;
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

/* Styling for the filter section */
.filter-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  margin-top: 25px;
  padding: 0 40px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

/* Styling each filter group */
.filter-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.filter-input,
.filter-select {
  width: 180px;
  padding: 8px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #fff;
  transition: border 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  border-color: #7274ff;
  outline: none;
}

/* Styling for the chart section */
.chart-section {
  margin-top: 20px;
  padding: 0 40px;
}

/* CSS cho bố cục của hai biểu đồ */
.charts-container {
  display: flex;
  gap: 20px; /* Khoảng cách giữa hai biểu đồ */
  justify-content: center;
  flex-wrap: wrap;
}

.chart-section {
  flex: 1; /* Cho phép hai biểu đồ cùng chiếm toàn bộ chiều ngang */
  min-width: 300px; 
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden; 
}

canvas {
  width: 100%; /* Chiều rộng của canvas sẽ được điều chỉnh theo kích thước section */
  height: 400px; /* Chiều cao cố định của biểu đồ để dễ nhìn */
}

/* Cấu hình để đảm bảo không bị đè khi sidebar hiện */
.AdminLayout {
  display: flex;
  overflow: hidden; /* Đảm bảo bố cục không bị tràn khi sidebar xuất hiện */
}

.AdminLayout > * {
  flex-shrink: 1; /* Đảm bảo nội dung co lại khi sidebar xuất hiện */
  min-width: 0;
}

.dashboard-overview {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 0 20px;
}

</style>
