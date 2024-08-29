<template>
  <aside :class="['sidebar', { 'is-expanded': is_expanded }]">
    <ul class="menu text">
      <li :class="['menu-item', { selected: openKeys.includes('sub1') }]">
        <div @click="toggleSubmenu('sub1')">
          <span class="material-icons"><i class="fa-solid fa-home"></i></span>
          Home
        </div>
        <transition name="slide">
          <ul v-if="openKeys.includes('sub1')">
            <li class="submenu-item">
              <button
                class="submenu-link"
                :class="{ selected: current === 'home-page' }"
                @click="
                  handleSubmenuItemClick('home-page');
                  navigateTo('/');
                "
              >
                Trang Chủ
              </button>
            </li>
            <li class="submenu-item">
              <button
                class="submenu-link"
                :class="{ selected: current === 'user' }"
                @click="
                  handleSubmenuItemClick('user');
                  navigateTo('/user');
                "
              >
                Quản Lý Người Dùng
              </button>
            </li>
            <li class="submenu-item">
              <button
                class="submenu-link"
                :class="{ selected: current === 'package' }"
                @click="
                  handleSubmenuItemClick('package');
                  navigateTo('/package');
                "
              >
                Quản Lý Gói
              </button>
            </li>
          </ul>
        </transition>
      </li>
      <li :class="['menu-item', { selected: openKeys.includes('sub2') }]">
        <div @click="toggleSubmenu('sub2')">
          <span class="material-icons"
            ><i class="fa-solid fa-building"></i
          ></span>
          Quản Lý Tổ Chức
        </div>
        <transition name="slide">
          <ul v-if="openKeys.includes('sub2')">
            <!-- <li class="submenu-item">
              <button
                class="submenu-link"
                :class="{ selected: current === 'register-organization' }"
                @click="
                  handleSubmenuItemClick('register-organization');
                  navigateTo('/organization/register');
                "
              >
                Register Organization
              </button>
            </li> -->
            <li class="submenu-item">
              <button
                class="submenu-link"
                :class="{ selected: current === 'organization-list' }"
                @click="
                  handleSubmenuItemClick('organization-list');
                  navigateTo('/organization/getOrganization');
                "
              >
                Danh Sách Tổ Chức
              </button>
            </li>
          </ul>
        </transition>
      </li>
      <li :class="['menu-item', { selected: openKeys.includes('sub4') }]">
        <div @click="toggleSubmenu('sub4')">
          <span class="material-icons"><i class="fa-solid fa-cog"></i></span>
          Cài Đặt
        </div>
        <transition name="slide">
          <ul v-if="openKeys.includes('sub4')">
            <li class="submenu-item">
              <button class="submenu-link">Option 9</button>
            </li>
            <li class="submenu-item">
              <button class="submenu-link">Option 10</button>
            </li>
            <li class="submenu-item">
              <button class="submenu-link">Option 11</button>
            </li>
            <li class="submenu-item">
              <button class="submenu-link">Option 12</button>
            </li>
          </ul>
        </transition>
      </li>
    </ul>

    <div class="menu">
      <router-link to="/pages/organizations" class="button">
        <span class="material-icons">
          <i class="fa-solid fa-pager"></i>
        </span>
        <span class="text">Trang Tổ Chức</span>
      </router-link>
    </div>

    <div class="bottom-menu">
      <div class="menu" v-if="!isLoggedIn">
        <router-link to="/login" class="button">
          <span class="material-icons">
            <i class="fa-solid fa-right-to-bracket"></i>
          </span>
          <span class="text">Đăng Nhập</span>
        </router-link>
      </div>

      <div v-else class="menu" @click="showModal">
        <div class="button">
          <span class="material-icons">
            <i class="fa-solid fa-right-from-bracket"></i>
          </span>
          <span class="text">Đăng Xuất</span>
        </div>
        <div v-if="isModal" class="modal-overlay">
          <a-modal
            title="Đăng xuất"
            :open="isModal"
            @ok="logout"
            @cancel="handleCancel"
            :ok-button-props="okButtonProps"
            okText="Đăng xuất"
            cancelText="Hủy"
          >
            <p>Bạn có chắc muốn đăng xuất khỏi hệ thống?</p>
          </a-modal>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const current = ref(null);

const router = useRouter();

const is_expanded = ref(localStorage.getItem("is_expanded") === "true");

const isLoggedIn = ref(!!localStorage.getItem("token"));

const openKeys = ref(["sub1"]);

const handleResize = () => {
  if (window.innerWidth < 768) {
    is_expanded.value = false;
  } else {
    is_expanded.value = localStorage.getItem("is_expanded") === "true";
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const ToggleMenu = () => {
  is_expanded.value = !is_expanded.value;
  localStorage.setItem("is_expanded", is_expanded.value);
};

const isModal = ref(false);
const okButtonProps = {
  style: {
    background: "red",
  },
};

const showModal = () => {
  isModal.value = true;
};

const logout = () => {
  localStorage.removeItem("token");
  isLoggedIn.value = false;
  router.push("/login");
};

const handleCancel = () => {
  isModal.value = false;
};

const toggleSubmenu = (key) => {
  if (openKeys.value.includes(key)) {
    openKeys.value = openKeys.value.filter((k) => k !== key);
  } else {
    openKeys.value.push(key);
  }
};

const handleSubmenuItemClick = (value) => {
  current.value = value;
  console.log("current value:", current.value);
};

const navigateTo = (path) => {
  router.push(path);
};
</script>

<style lang="scss" scoped>
@import "SidebarAdmin.scss";
</style>
