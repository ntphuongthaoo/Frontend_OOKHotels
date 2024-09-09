<template>
  <header>
    <div class="top-header">
      <div class="container">
        <div class="float-left">
          <ul class="header-social">
            <li><a href="#">Contact Us +44 (012) 5689 3264</a></li>
          </ul>
        </div>
        <!-- <div class="float-right">
          <div class="nice-select-wrapper">
            <select class="currency-selector" style="display: none">
              <option value="1">USD</option>
            </select>
            <div class="nice-select currency-select" tabindex="0">
              <span class="current">USD</span>
            </div>
          </div>
          <div class="nice-select-wrapper">
            <select class="language-selector" style="display: none">
              <option value="1">ENG</option>
              <option value="1">FRA</option>
              <option value="1">BAN</option>
            </select>
            <div class="nice-select language-select" tabindex="0">
              <span class="current">ENG</span>
            </div>
          </div>
        </div> -->
        <div class="float-right">
          <div v-if="!isLoggedIn" class="welcome-message">
            CHÀO MỪNG BẠN ĐÉN VỚI OOK_CHỐN DỪNG CHÂN TUYỆT VỜI !!
          </div>
          <div v-else class="user-info">
            <i class="fa fa-user-circle-o user-icon"></i>
            <span class="user-name">{{ userInfo?.FULLNAME || 'User' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="separator"></div>
    <div class="main-menu">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <a class="navbar-brand logo" href="/trangchu">
            <img src="../../assets/logo_ôk.png" alt="OOK Logo" />
          </a>
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
            <ul class="navbar-nav ml-auto">
              <li class="nav-item active">
                <a class="nav-link" href="/trangchu">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="about-us.html">About</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="gallery.html">Gallery</a>
              </li>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  >Pages</a
                >
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="elements.html">Elements</a>
                  <a class="dropdown-item" href="rooms.html">Rooms</a>
                </div>
              </li>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  >Blog</a
                >
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="blog.html">Blog</a>
                  <a class="dropdown-item" href="single-blog.html"
                    >Blog Details</a
                  >
                </div>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="contact.html">Contact</a>
              </li>
            </ul>
            <div class="auth-links">
              <template v-if="isLoggedIn">
                <a class="btn auth-btn logout-btn" @click="logout">Đăng xuất</a>
              </template>
              <template v-else>
                <a class="btn auth-btn login-btn" href="/dangnhap">Đăng nhập</a>
                <a class="btn auth-btn register-btn" href="/dangky">Đăng ký</a>
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

export default {
  name: "HeaderComponent",
  data() {
    return {
      isNavbarOpen: false,
    };
  },
  computed: {
    ...mapGetters(["isLoggedIn", "userInfo"]),
  },
  methods: {
    ...mapActions(["logout"]),
    toggleNavbar() {
      this.isNavbarOpen = !this.isNavbarOpen;
    },
  },
  mounted() {
    this.$store.dispatch("checkToken"); // Kiểm tra trạng thái đăng nhập khi component được mount
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

  .top-header.hidden {
    opacity: 0;
    transform: translateY(-100%);
  }

  .top-header {
    transition: opacity 0.3s ease, transform 0.3s ease;
    background-color: #bfaf9f; // Nâu trung bình cho phần top-header
    padding: 10px 20px;
    .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-right: 15px;
      padding-left: 15px;
      margin-right: auto;
      margin-left: auto;
    }
    .float-left {
      .header-social {
        list-style: none;
        margin: 0;
        padding: 0;
        li {
          a {
            color: #6d4c41; // Màu nâu đậm hơn cho text
            text-decoration: none;
          }
        }
      }
    }

    .float-right {
      display: flex;
      .nice-select-wrapper {
        margin-left: 20px;
      }
    }
    .welcome-message {
      font-size: 16px;
      color: #333;
    }

    .user-info {
      display: flex;
      align-items: center;
    }

    .user-icon {
      font-size: 30px; /* Cài đặt kích thước icon */
      color: #333; /* Cài đặt màu sắc cho icon */
      margin-right: 10px;
    }

    .user-name {
      font-size: 16px;
      color: #333;
    }
  }

  .separator {
    border-top: 1px solid #d9c7b8; // Nâu trung bình cho đường phân cách
    margin-bottom: 0;
  }

  .main-menu {
    background-color: #d9c7b8; // Nâu đậm cho nền navbar
    .navbar {
      .container {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .logo img {
          height: 40px;
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
              background-color: #ffffff; // Màu trắng cho biểu tượng hamburger
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

            .nav-link {
              color: #ffffff; // Màu trắng cho text link
              transition: color 0.3s;

              &:hover {
                color: #6d4c41; // Màu nâu đậm khi hover
              }
            }

            .dropdown-menu {
              background-color: #6d4c41; // Nâu đậm cho nền dropdown
              border: 1px solid #d9c7b8; // Nâu trung bình cho viền dropdown
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              .dropdown-item {
                color: #ffffff; // Màu trắng cho text dropdown
                transition: background-color 0.3s;

                &:hover {
                  background-color: #d9c7b8; // Màu nâu trung bình khi hover
                }
              }
            }
          }
        }

        .auth-links {
          display: flex;
          align-items: center;
          gap: 10px; /* Khoảng cách giữa các nút */
          margin-left: auto; /* Đưa auth-links sang bên phải */

          .btn {
            display: inline-block;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 4px;
            text-align: center;
            transition: background-color 0.3s, border-color 0.3s, color 0.3s;
            border: 2px solid; // Màu viền thay đổi tùy theo loại nút
            color: #ffffff; // Màu trắng cho text nút

            &:hover {
              background-color: #6d4c41; // Màu nâu đậm cho nền khi hover
              color: #ffffff; // Màu trắng cho text khi hover
              border-color: #6d4c41; // Màu nâu đậm cho viền khi hover
            }
          }

          .login-btn {
            border-color: #ffffff; // Màu trắng cho viền nút đăng nhập
            background-color: transparent; // Nền trong suốt cho nút đăng nhập
          }

          .register-btn {
            border-color: #d9c7b8; // Màu nâu trung bình cho viền nút đăng ký
            background-color: #d9c7b8; // Màu nâu trung bình cho nền nút đăng ký
            color: #3f0e00; // Màu nâu tối cho text nút đăng ký
          }

          .register-btn:hover {
            background-color: #6d4c41; // Màu nâu đậm cho nền nút đăng ký khi hover
            border-color: #6d4c41; // Màu nâu đậm cho viền nút đăng ký khi hover
          }
          .logout-btn {
            border-color: #3f0e00;
            background-color: #d9c7b8;
            color: #3f0e00;
          }

          .logout-btn:hover {
            background-color: #6d4c41;
            border-color: #6d4c41;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .main-menu {
      .navbar-collapse {
        .navbar-nav {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    }
  }
}
</style>
