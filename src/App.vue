<script setup>
import "vue3-toastify/dist/index.css";
import ChatLayout from './layouts/ChatLayout/ChatLayout.vue';
import UserLayout from './layouts/UserLayout/UserLayout.vue';
import AdminLayout from './layouts/AdminLayout/AdminLayout.vue';
import LoginLayout from './layouts/Login/LoginLayout.vue';

import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const layout = computed(() => {
  // Kiểm tra `meta.layout` và trả về component trực tiếp nếu đã import đúng
  if (route.meta.layout === ChatLayout) return ChatLayout;
  if (route.meta.layout === AdminLayout) return AdminLayout;
  if (route.meta.layout === UserLayout) return UserLayout;
  if (route.meta.layout === LoginLayout) return LoginLayout;
  return UserLayout; // Layout mặc định
});
</script>

<template>
  <div>
    <!-- Hiển thị layout dựa trên giá trị layout -->
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>


<style lang="scss">
:root {
	--primary: #4ade80;
	--primary-alt: #22c55e;
	--grey: #64748b;
	--dark: #1e293b;
	--dark-alt: #334155;
	--light: #fff;
	--sidebar-width: 300px;
}

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: "Lato", sans-serif;
	font-style: normal;
}

body {
	background: var(--light);
}

button {
	cursor: pointer;
	appearance: none;
	border: none;
	outline: none;
	background: none;
}

.app {
	display: flex;

	main {
		flex: 1 1 0;
		padding: 2rem;

		@media (max-width: 1024px) {
			padding-left: 6rem;
		}
	}
}
</style>