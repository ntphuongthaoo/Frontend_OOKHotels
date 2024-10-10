<template>
  <header>
    <div class="separator"></div>
    <div class="main-menu">
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <button
            class="navbar-toggler"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            @click="toggleNavbar"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div
            :class="['collapse', 'navbar-collapse', { show: isNavbarOpen }]"
            id="navbarSupportedContent"
          >
            <div class="group-navbar">
              <ul class="navbar-nav ml-auto">
                <li class="nav-item active">
                  <a class="nav-link" href="/home">Trang chủ</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/booking-history">Lịch sử</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="gallery.html">Vị Trí</a>
                </li>

                <li class="nav-item">
                  <a class="nav-link" href="contact.html">Liên hệ</a>
                </li>
              </ul>
            </div>

            <div class="group-navbar">
              <a class="navbar-brand logo" href="/home">
                <img
                  src="../../assets/LOGO_MAIN.png"
                  alt="OOK Logo"
                  class="logo"
                />
              </a>
            </div>

            <div class="auth-links group-navbar">
              <template v-if="isLoggedIn">
                <span class="user-name">{{
                  userInfo?.FULLNAME || "User"
                }}</span>
                <a class="btn auth-btn logout-btn" @click="logout">Đăng xuất</a>
                <a href="/cart" class="cart-icon" :data-count="cartItemCount">
                  <i class="fas fa-shopping-cart"></i>
                </a>
              </template>
              <template v-else>
                <a class="btn auth-btn login-btn" href="/login">Đăng nhập</a>
                <a class="btn auth-btn register-btn" href="/register">Đăng ký</a>
                <a
                  href="/cart"
                  class="cart-icon"
                  v-if="cartItemCount > 0"
                  :data-count="cartItemCount"
                >
                  <i class="fas fa-shopping-cart"></i>
                </a>
              </template>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import axiosClient from "../../api/axiosClient";

export default {
  name: "HeaderComponent",
  data() {
    return {
      isNavbarOpen: false,
      cartItemCount: 0,
    };
  },
  computed: {
    ...mapGetters(["isLoggedIn", "userInfo", "cartItemCount"]),
  },
  methods: {
    ...mapActions(["logout", "fetchCart"]),
    toggleNavbar() {
      this.isNavbarOpen = !this.isNavbarOpen;
    },
  },
  async mounted() {
    // Chuyển async mounted ra ngoài methods
    await this.$store.dispatch("checkToken"); // Kiểm tra trạng thái đăng nhập khi component được mount
    if (this.isLoggedIn) {
      await this.fetchCart();
    }
  },
  watch: {
    "$store.state.cart": {
      handler() {
        this.cartItemCount = this.$store.getters.cartItemCount;
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss">
header {
  background-color: #f8f1e7; // Nâu nhạt cho nền header
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: background 0.4s ease-in-out;

  .user-name {
    font-weight: 800;
    font-size: 16px;
    color: #d9c7b8;
  }

  .separator {
    border-top: 1px solid #d9c7b8; // Nâu trung bình cho đường phân cách
    margin-bottom: 0;
  }

  .main-menu {
    background-color: #6d4c41; // Nâu đậm cho nền navbar

    .navbar {
      padding: 1rem 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;

      .logo {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        justify-content: center;
        align-items: center;

        img {
          height: 50px;
        }
      }

      .navbar-toggler {
        border: none;
        background: transparent;
        .navbar-toggler-icon {
          display: block;
          width: 30px;
          height: 3px;
          background-color: #ffffff; // Màu trắng cho biểu tượng hamburger
          position: relative;
          &:before,
          &:after {
            content: "";
            display: block;
            width: 30px;
            height: 3px;
            background-color: #ffffff;
            position: absolute;
            left: 0;
            transition: transform 0.3s ease;
          }
          &:before {
            top: -8px;
          }
          &:after {
            top: 8px;
          }
        }
      }

      .navbar-collapse {
        display: none; /* Ẩn menu mặc định */
        &.show {
          display: block; /* Hiển thị menu khi lớp 'show' được thêm */
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;

          .nav-link {
            color: #ffffff;
            transition: color 0.3s;
            position: relative;
            padding: 12px 20px;
            min-width: 120px;
            text-align: center;
            transition: color 0.3s ease;

            &:hover {
              color: #f5c490;
            }

            &::after {
              content: "";
              position: absolute;
              width: 0;
              height: 2px;
              background-color: #f8b400;
              left: 0;
              bottom: 0;
              transition: width 0.3s ease;
            }

            &:hover::after {
              width: 100%;
            }
          }

          .dropdown-menu {
            background-color: #6d4c41;
            border: 1px solid #d9c7b8;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            .dropdown-item {
              color: #ffffff;
              transition: background-color 0.3s;

              &:hover {
                background-color: #d9c7b8;
              }
            }
          }
        }
      }

      .auth-links {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-left: auto;

        .btn {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 4px;
          text-align: center;
          border: 2px solid;
          color: #ffffff;
          transition: background-color 0.3s, border-color 0.3s, color 0.3s;

          &:hover {
            background-color: #6d4c41;
            color: #ffffff;
            border-color: #f5c490;
          }
        }

        .cart-icon {
          font-size: 24px;
          color: #ffffff; // Màu trắng cho icon giỏ hàng
          position: relative; // Để thêm thông báo số lượng sản phẩm sau này
          margin-right: 20px;
          text-decoration: none;
          transition: color 0.3s ease;
          margin-left: 20px;

          &:hover {
            color: #f5c490; // Màu vàng nhạt khi hover
          }
        }
        .cart-icon::after {
          content: attr(data-count);
          position: absolute;
          top: -10px;
          right: -10px;
          background-color: #f5c490;
          color: #3f0e00;
          border-radius: 50%;
          padding: 2px 5px;
          font-size: 12px;
          display: none; /* Ẩn nếu chưa có sản phẩm */
        }

        .cart-icon[data-count]:not([data-count="0"])::after {
          display: block; /* Hiển thị khi data-count khác 0 */
        }

        .login-btn {
          border-color: #ffffff;
          background-color: transparent;
        }

        .register-btn {
          border-color: #d9c7b8;
          background-color: #d9c7b8;
          color: #3f0e00;

          &:hover {
            background-color: #6d4c41;
            border-color: #f5c490;
          }
        }

        .logout-btn {
          border-color: #3f0e00;
          background-color: #d9c7b8;
          color: #3f0e00;

          &:hover {
            background-color: #6d4c41;
            border-color: #6d4c41;
          }
        }
      }
    }
  }

  @media (max-width: 300px) {
    .main-menu {
      .navbar {
        flex-direction: column;
        align-items: center;

        // Đặt logo lên đầu
        .group-navbar:nth-child(1) {
          position: static; // Khi màn hình nhỏ, logo không cần absolute
          order: -2; // Đưa logo lên đầu
          margin-bottom: 15px; // Khoảng cách logo và menu
        }
      }

      .navbar-collapse {
        .navbar-nav {
          flex-direction: column;
          align-items: flex-start;
        }

        .auth-links {
          flex-direction: column;
          gap: 5px;
          align-items: center;
        }

        .btn {
          width: 100%;
          text-align: left;
          padding: 10px 0;
        }
      }
    }
  }
}
</style>
