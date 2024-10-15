import { createRouter, createWebHistory } from 'vue-router'

// import AdminLayout from "../layouts/AdminLayout/AdminLayout.vue"
// Users
import UserLayout from "../layouts/UserLayout/UserLayout.vue"
import Login from '../views/Login/Login.vue'
import LoginLayout from '../layouts/Login/LoginLayout.vue'
import RegisterUser from '../views/RegisterUser/RegisterUser.vue'
import HomeUser from '../views/User/HomeUser/HomeUser.vue'

// Hotels
import HotelDetail from '../views/HotelDetail/HotelDetail.vue'
import ListHotels from '../views/ListHotels/ListHotels.vue'
import BookingPage from '../views/Booking/BookingPage.vue'
import CartPage from '../views/Cart/CartPage.vue'
import PaymentPage from '../views/Payment/PaymentPage.vue'
import BookingHistory from '../views/BookingHistory/BookingHistory.vue'

// dashboard
import AdminLayout from '../layouts/AdminLayout/AdminLayout.vue'
import MainPage from '../views/Dashboard/MainPage.vue'
// Page Organization
import store from "@/store"
 

const routes = [
	{
		path: "/login",
		name: "Login",
		component: Login,
		meta: {
			layout: LoginLayout,
		}
	},
	{
		path: "/register",
		component: RegisterUser,
		meta: {
			layout: LoginLayout,
		}
	},
	{
		path: "/home",
		component: HomeUser,
		meta: {
			layout: UserLayout,
		}
	},
	{
		path: "/danh-sach-khach-san",
		component: ListHotels,
		meta: {
			layout: UserLayout,
		}
	},
	{
		path: "/home/hotel/:id",
		name: "HotelDetail",
		component: HotelDetail,
		meta: {
			layout: UserLayout,
		},
		props: true,
	},
	{
		path: "/cart",
		name: "CartPage",
		component: CartPage,
		meta: {
			layout: UserLayout,
		},
		props: true,
	},
	{
		path: '/booking',
		name: 'BookingPage',
		component: BookingPage,
		meta: {
			layout: UserLayout,
		},
	},
	{
		path: '/booking/payment',
		name: 'PaymentPage',
		component: PaymentPage,
		meta: {
			layout: UserLayout,
		},
	  },
	{
		path: '/booking-history',
		name: 'BookingHistory',
		component: BookingHistory,
		meta: {
			layout: UserLayout,
		},
	  },

	// Dashboard
	{
		path: "/loginadmin",
		name: "LoginAdmin",
		component: Login,
		meta: {
			layout: LoginLayout,
		}
	},
	{
		path: "/dashboard",
		component: MainPage,
		meta: {
			layout: AdminLayout,
		}
	},
	
]
const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
	  if (savedPosition) {
		return savedPosition; // Nếu có vị trí cuộn được lưu, cuộn lại vị trí đó
	  } else {
		return { top: 0 }; // Cuộn về đầu trang
	  }
	},
  });

router.beforeEach((to, from, next) => {
	console.log("Chuyển hướng đến:", to.name);
  next();
    // const isLoggedIn = store.getters.isLoggedIn; // Kiểm tra trạng thái đăng nhập
    // const userInfo = store.getters.userInfo; // Lấy thông tin người dùng

    // let userRole = '';
    // if (userInfo?.ROLE?.ADMIN) {
    //     userRole = 'admin';
    // } else if (userInfo?.ROLE?.BRANCH_MANAGER) {
    //     userRole = 'branch_manager';
    // } else if (userInfo?.ROLE?.STAFF) {
    //     userRole = 'staff';
    // } else {
    //     userRole = 'user';
    // }

    // // Nếu người dùng đã đăng nhập và cố gắng truy cập trang đăng nhập thì chuyển hướng
    // if (to.path === '/login' && isLoggedIn) {
    //     if (userRole === 'admin') {
    //         return next('/dashboard'); // Chuyển hướng admin đến dashboard
    //     } else {
    //         return next('/home'); // Chuyển hướng người dùng thường đến trang chủ
    //     }
    // }

    // // Nếu trang yêu cầu xác thực và người dùng chưa đăng nhập thì chuyển đến trang đăng nhập
    // if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    //     // Chuyển hướng đến trang đăng nhập và lưu lại trang hiện tại trong query.redirect
    //     return next({
    //         path: '/login',
    //         query: { redirect: to.fullPath } // Lưu đường dẫn của trang hiện tại
    //     });
    // }

    // // Nếu không có vấn đề gì, tiếp tục điều hướng
    // next();
});



export default router;
