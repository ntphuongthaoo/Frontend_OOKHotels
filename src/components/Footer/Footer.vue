<template>
  <footer ref="footer" class="footer">
    <div class="footer-container">
      <div class="footer-section about">
        <h3>Về ETHEREAL</h3>
        <p>
          ETHEREAL là nền tảng đặt phòng khách sạn hàng đầu, mang đến cho bạn
          những trải nghiệm lưu trú tuyệt vời với giá cả phải chăng. Chúng tôi
          cam kết mang đến cho khách hàng sự tiện lợi và lựa chọn đa dạng nhất.
        </p>
      </div>

      <div class="footer-section links">
        <h3>Liên kết nhanh</h3>
        <ul>
          <li><a href="/trangchu">Trang chủ</a></li>
          <li><a href="/danh-sach-khach-san">Khách sạn</a></li>
          <li><a href="/about">Về chúng tôi</a></li>
          <li><a href="/contact">Liên hệ</a></li>
        </ul>
      </div>

      <div class="footer-section contact">
        <h3>Liên hệ</h3>
        <p><i class="fa fa-phone"></i> +84 123 456 789</p>
        <p><i class="fa fa-envelope"></i> support@ook.com</p>
        <p>
          <i class="fa fa-map-marker"></i> 123 Đường Lê Lợi, Hà Nội, Việt Nam
        </p>
      </div>

      <div class="footer-section social">
        <h3>Kết nối với chúng tôi</h3>
        <div class="social-links">
          <a href="#"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-linkedin"></i></a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2024 OOK. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "FooterComponent",
  mounted() {
    this.updateFooterOffset();
    window.addEventListener('resize', this.updateFooterOffset); // Cập nhật khi thay đổi kích thước cửa sổ
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateFooterOffset);
  },
  methods: {
    updateFooterOffset() {
      const footer = this.$refs.footer; // Sử dụng ref để lấy phần tử footer
      if (footer) {
        this.$store.dispatch('updateFooterOffset', footer.offsetTop); // Gửi vị trí của footer vào Vuex
      }
    },
  },
};
</script>

<style scoped lang="scss">
.footer {
  background-color: #6d4c41; // Màu nền tối cho footer
  color: #ffffff;
  padding: 50px 0; // Giảm padding trên và dưới để làm cho footer gọn hơn
  font-size: 14px;
  z-index: 999;

  .footer-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 20px;
    max-width: 1400px; // Tăng chiều rộng tối đa để nội dung trải rộng hơn
    margin: 0 auto;
    padding: 0 40px; // Giảm padding trái và phải để nội dung gần hơn với bìa
    width: 100%;

    .footer-section {
      flex: 1 1 200px;

      h3 {
        margin-bottom: 15px;
        font-size: 16px;
        font-weight: bold;
      }

      p,
      ul {
        margin: 0;
        padding: 0;
        list-style: none;

        li {
          margin-bottom: 10px;

          a {
            color: #ffffff;
            text-decoration: none;
            transition: color 0.3s;

            &:hover {
              color: #f8b400; // Màu vàng khi hover
            }
          }
        }
      }
    }

    .footer-section link {
      margin-left: 30px;
    }

    .about {
      max-width: 300px;
    }

    .social-links {
      display: flex;
      gap: 10px;

      a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background-color: #555;
        color: #ffffff;
        border-radius: 50%;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f8b400;
        }
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-top: 10px;
    border-top: 1px solid #555;
    margin-top: 10px;
  }
}
</style>
