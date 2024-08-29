<template>
  <div class="containPage">
    <h2 class="name-page">Thông tin tất cả người dùng đang hoạt động</h2>
    <div class="user_active_list">
      <div v-for="user in activeUsers" :key="user._id" class="user-info">
        <p>User Name: <strong>{{ user.USERNAME }}</strong></p>
        <!-- <p>User ID: {{ user._id }}</p> -->
        <p>Full Name: {{ user.FULLNAME }}</p>
        <p>Gender: {{ user.GENDER }}</p>
        <p>Email: {{ user.EMAIL }}</p>
        <a-button type="danger" v-if="isLoggedIn" @click="showBlockModal(user)" class="blockbutton">Block</a-button>
      </div>
    </div>
    <a-modal
      style="top: 40px; font-size: 20px;"
      v-model:open="isModalVisible"
      title="Xác nhận chặn người dùng"
      @ok="handleOk"
      @cancel="handleCancel"
      :ok-button-props="okButtonProps"
      okText="Xác nhận"
      cancelText="Đóng"
    >
      <p style="font-size: 17px;">Bạn có chắc chắn muốn chặn người dùng: <strong>{{ selectedUser.USERNAME }}</strong>?</p>
    </a-modal>
  </div>
</template>

<script>
import axiosClient from '../../../api/axiosClient';
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      activeUsers: [],
      isModalVisible: false,
      selectedUser: null,
      okButtonProps: {
        style: {
          background: "red",
        },
      },
    };
  },
  mounted() {
    this.fetchActiveUsers();
  },
  methods: {
    ...mapActions(['isLoggedIn','blockUser']),

    async fetchActiveUsers() {
      try {
        const response = await axiosClient.get('/user/getUsers', {
          params: {
            tabStatus: '2',
            page: 1,
            limit: 10
          }
        });
        this.activeUsers = response.data.users;
      } catch (error) {
        console.error('Error fetching active users:', error);
      }
    },
    showBlockModal(user) {
      this.selectedUser = user;
      this.isModalVisible = true;
    },
    async handleOk() {
      try {
        await this.blockUser(this.selectedUser._id);
        this.isModalVisible = false;
        this.fetchActiveUsers();
      } catch (error) {
        console.error('Error blocking user:', error);
      }
    },
    handleCancel() {
      this.isModalVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./BlockUser.scss";

</style>
