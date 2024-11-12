<template>
  <div class="voucher-section">
    <h2 class="section-title">TẤT CẢ ƯU ĐÃI DÀNH CHO BẠN</h2>
    <div class="voucher-list">
      <div v-for="voucher in vouchers" :key="voucher._id" class="voucher-card">
        <div class="voucher-header">
          <h3 class="voucher-code">{{ voucher.CODE }}</h3>
          <p class="discount">Giảm {{ voucher.DISCOUNT_PERCENTAGE }}%</p>
        </div>
        <div class="voucher-details">
          <p class="voucher-condition" v-if="voucher.MIN_TOTAL_AMOUNT">
            Áp dụng cho đơn từ
            {{ voucher.MIN_TOTAL_AMOUNT.toLocaleString("vi-VN") }} VND
          </p>
          <p class="voucher-condition" v-if="voucher.MIN_NIGHTS">
            Áp dụng cho từ {{ voucher.MIN_NIGHTS }} đêm
          </p>
          <p class="voucher-condition" v-if="voucher.ROOM_TYPES.length">
            Phòng áp dụng: {{ voucher.ROOM_TYPES.join(", ") }}
          </p>
          <div class="voucher-hotels" v-if="voucher.APPLICABLE_HOTELS.length">
            <p
              class="hotel-title"
              @click="voucher.showHotels = !voucher.showHotels"
              style="cursor: pointer"
            >
              Khách sạn áp dụng:
              <span v-if="!voucher.showHotels">▼</span>
              <span v-else>▲</span>
            </p>

            <!-- Danh sách khách sạn, chỉ hiển thị khi showHotels = true -->
            <ul class="hotel-list" v-show="voucher.showHotels">
              <li v-for="hotel in voucher.APPLICABLE_HOTELS" :key="hotel._id">
                {{ hotel.NAME }}
              </li>
            </ul>
          </div>
          <p class="voucher-expiration">
            Hạn sử dụng: {{ formatDate(voucher.EXPIRATION_DATE) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../api/axiosClient";

export default {
  data() {
    return {
      vouchers: [],
    };
  },
  async mounted() {
    try {
      const response = await axiosClient.get("/vouchers/getAllVouchers");
      // Thêm thuộc tính showHotels vào từng voucher để kiểm soát hiển thị danh sách khách sạn
      this.vouchers = response.data.map(voucher => ({
        ...voucher,
        showHotels: false,
      }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách voucher:", error);
    }
  },
  methods: {
    formatDate(date) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(date).toLocaleDateString("vi-VN", options);
    },
  },
};
</script>

<style scoped>
.voucher-section {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(to bottom right, #f4f4f9, #eaeaea);
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #6d4c41;
  background: linear-gradient(to right, #6d4c41, #7274ff);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 40px;
}

.voucher-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.voucher-card {
  width: 350px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s, box-shadow 0.3s;
}

.voucher-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.voucher-header {
  width: 100%;
  padding: 20px;
  background: linear-gradient(to right, #6d4c41, #7274ff);
  color: #fff;
  text-align: center;
  height: 170px; /* Chiều cao cố định */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Căn giữa nội dung theo chiều dọc */
  align-items: center;
}

.voucher-code {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
  margin-top: 15px;
}

.discount {
  font-size: 1.5rem;
  color: #ff4d4d;
}

.voucher-details {
  flex-grow: 1; /* Để phần voucher-details giãn đều */
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 0 0 10px 10px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #333;
  text-align: justify;
}

.voucher-condition {
  font-size: 15px;
  margin: 8px 0;
}

.voucher-condition:before {
  content: "✔";
  margin-right: 8px;
  color: #6d4c41;
}

.voucher-expiration {
  font-size: 15px;
  color: #ff4d4d;
  margin-top: 10px;
  text-align: center;
  font-style: italic;
}

.voucher-expiration:before {
  content: "⏳";
  font-size: 18px;
  color: #ff4d4d;
  margin-right: 5px;
}

.voucher-hotels {
  margin-top: 10px;
  font-size: 15px;
}

.hotel-title {
  font-weight: bold;
  color: #6d4c41;
  margin-bottom: 5px;
  cursor: grab;
}

.hotel-list {
  list-style-type: none; /* Bỏ dấu chấm đầu dòng */
  padding: 0;
  margin: 0;
}

.hotel-list li:before {
  content: "🏨";
  margin-right: 6px;
}

.view-more-btn {
  background: linear-gradient(to right, #6d4c41, #7274ff);
  color: white;
  padding: 10px 30px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-top: 40px;
}

.view-more-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
</style>
