<template>
  <header>
    <div class="top-header">
      <div class="container">
        <div class="float-left">
          <ul class="header-social">
            <li><a href="#">Contact Us +44 (012) 5689 3264</a></li>
          </ul>
        </div>
        <div class="float-right">
          <div class="nice-select-wrapper">
            <select class="currency-selector" style="display: none;">
              <option value="1">USD</option>
            </select>
            <div class="nice-select currency-select" tabindex="0">
              <span class="current">USD</span>
            </div>
          </div>
          <div class="nice-select-wrapper">
            <select class="language-selector" style="display: none;">
              <option value="1">ENG</option>
              <option value="1">FRA</option>
              <option value="1">BAN</option>
            </select>
            <div class="nice-select language-select" tabindex="0">
              <span class="current">ENG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="separator"></div>
    <div class="main-menu">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <a class="navbar-brand logo" href="/trangchu">
            <img src="../../assets/LogoOOK.png" alt="OOK Logo" />
          </a>
          <button class="navbar-toggler" type="button" aria-controls="navbarSupportedContent" aria-expanded="false"
          aria-label="Toggle navigation" @click="toggleNavbar">
          <span class="navbar-toggler-icon"></span>
          </button>
          <div :class="['collapse', 'navbar-collapse', { show: isNavbarOpen }]" id="navbarSupportedContent">
            <ul class="navbar-nav ml-auto">
              <li class="nav-item active"><a class="nav-link" href="index.html">Home</a></li>
              <li class="nav-item"><a class="nav-link" href="about-us.html">About</a></li>
              <li class="nav-item"><a class="nav-link" href="gallery.html">Gallery</a></li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Pages</a>
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="elements.html">Elements</a>
                  <a class="dropdown-item" href="rooms.html">Rooms</a>
                </div>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Blog</a>
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="blog.html">Blog</a>
                  <a class="dropdown-item" href="single-blog.html">Blog Details</a>
                </div>
              </li>
              <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent',
  data() {
    return {
      isNavbarOpen: false
    };
  },
  methods: {
    toggleNavbar() {
      this.isNavbarOpen = !this.isNavbarOpen;
    }
  }
};
</script>

<style lang="scss">
header {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: background 0.4s ease-in-out;

  .top-header {
    background-color: #f8f9fa;
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
            color: #777777;
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
  }

  .separator {
    border-top: 1px solid #dee2e6;
  }

  .main-menu {
    background-color: #ffffff;
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
            background-color: #333;
            position: relative;
            &:before,
            &:after {
              content: '';
              display: block;
              width: 30px;
              height: 3px;
              background-color: #333;
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
              color: #333;
              transition: color 0.3s;

              &:hover {
                color: #007bff;
              }
            }

            .dropdown-menu {
              background-color: #ffffff;
              border: 1px solid #e3e3e3;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              .dropdown-item {
                color: #333;
                transition: background-color 0.3s;

                &:hover {
                  background-color: #007bff;
                }
              }
            }
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

