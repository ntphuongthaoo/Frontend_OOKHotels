import { createRouter, createWebHistory } from 'vue-router'

// import AdminLayout from "../layouts/AdminLayout/AdminLayout.vue"
import UserLayout from "../layouts/UserLayout/UserLayout.vue"
import Login from '../views/Login/Login.vue'
import LoginLayout from '../layouts/Login/LoginLayout.vue'
import RegisterUser from '../views/RegisterUser/RegisterUser.vue'
import HomeUser from '../views/User/HomeUser/HomeUser.vue'

// Hotels
import HotelDetail from '../views/HotelDetail/HotelDetail.vue'


// Page Organization
import store from "@/store"
 

const routes = [
	{
		path: "/dangnhap",
		component: Login,
		meta: {
			layout: LoginLayout,
		}
	},
	{
		path: "/dangky",
		component: RegisterUser,
		meta: {
			layout: LoginLayout,
		}
	},
	{
		path: "/trangchu",
		component: HomeUser,
		meta: {
			layout: UserLayout,
		}
	},
	{
		path: "/trangchu/khach-san/:id",
		name: "HotelDetail",
		component: HotelDetail,
		meta: {
			layout: UserLayout,
		},
		props: true,
	},
	// {
	// 	path: "/danh-sach-khach-san",
	// 	component: HomeUser,
	// 	meta: {
	// 		layout: UserLayout,
	// 	}
	// },
	
]
const router = createRouter({
	history: createWebHistory(),
	routes,
})

// router.beforeEach((to, from, next) => {
// 	const isLoggedIn = store.getters.isLoggedIn;
// 	const userInfo = store.getters.userInfo;
	
// 	let userRole = '';
// 	if (userInfo?.ROLE?.ADMIN) {
// 	  userRole = 'admin';
// 	} else if (userInfo?.ROLE?.BRANCH_MANAGER) {
// 	  userRole = 'branch_manager';
// 	} else if (userInfo?.ROLE?.STAFF) {
// 	  userRole = 'staff';
// 	} else {
// 	  userRole = 'guest';
// 	}
  
// 	if (to.matched.some(record => record.meta.requiresAuth)) {
// 	  if (isLoggedIn) {
// 		if (userRole === 'guest') {
// 		  next('/trangchu'); // Chuyển hướng đến trang chủ nếu không có vai trò
// 		} else if (to.matched.some(record => record.meta.roles && record.meta.roles.includes(userRole))) {
// 		  next(); // Cho phép truy cập trang yêu cầu vai trò cụ thể
// 		} else {
// 		  next('/trangchu'); // Chuyển hướng đến trang chủ nếu không có quyền truy cập
// 		}
// 	  } else {
// 		next('/dangnhap'); // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
// 	  }
// 	} else {
// 	  next(); // Cho phép truy cập nếu không yêu cầu xác thực
// 	}
//   });  


export default router;
