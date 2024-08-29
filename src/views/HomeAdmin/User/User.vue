<template>
  <div class="containPage" v-if="isLoggedIn">
    <h2>Danh sách người dùng</h2>
    <div class="header-container d-flex">
      <div class="search-bar">
        <div class="container-1">
          <span @click="handleSearch" class="iconSearch">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            class="inputSearch"
            placeholder="Nhập từ khóa tìm kiếm"
            type="search"
            id="search"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            @input="debouncedSearchUsers"
          />
        </div>
      </div>

      <div class="blockbutton">
        <router-link to="/user/blockUser">
          <a-button type="danger">Block User</a-button>
        </router-link>
      </div>
    </div>
    <a-spin :spinning="isLoading">
      <div class="contentPage" v-if="isLoggedIn">
        <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
          <a-tab-pane key="4" tab="Tất cả người dùng">
            <template v-if="allUsers.length > 0">
              <a-table
                :dataSource="allUsers"
                :columns="columns"
                rowKey="_id"
                :pagination="false"
              />
              <a-pagination
                :current="currentPage"
                :total="totalCount"
                :pageSize="pageSize"
                @change="handlePageChange"
              />
            </template>
            <template v-else>
              <p class="no-results">Không có người dùng phù hợp.</p>
            </template>
          </a-tab-pane>
          <a-tab-pane key="1" tab="Chưa active">
            <h4>Danh sách người dùng chưa active</h4>
            <a-table
              :dataSource="inactiveUsers"
              :columns="columnsInactive"
              rowKey="_id"
              :pagination="false"
            >
            </a-table>
            <a-pagination
              :current="currentPage"
              :total="totalCount"
              :pageSize="pageSize"
              @change="handlePageChange"
            />
          </a-tab-pane>
          <a-tab-pane key="2" tab="Đang hoạt động" force-render>
            <!-- <h4>Danh sách người dùng đang hoạt động</h4> -->
            <a-table
              :dataSource="activeUsers"
              :columns="columnsActive"
              rowKey="_id"
              :pagination="false"
            >
            </a-table>
            <a-pagination
              :current="currentPage"
              :total="totalCount"
              :pageSize="pageSize"
              @change="handlePageChange"
            />
          </a-tab-pane>

          <a-tab-pane key="3" tab="Bị block">
            <!-- <h4>Danh sách người dùng bị block</h4> -->
            <a-table
              :dataSource="blockedUsers"
              :columns="columnsBlocked"
              rowKey="_id"
              :pagination="false"
            >
            </a-table>
            <a-pagination
              :current="currentPage"
              :total="totalCount"
              :pageSize="pageSize"
              @change="handlePageChange"
            />
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>
    <a-modal
      style="top: 40px; font-size: 20px"
      v-model:open="isModalVisible"
      title="Xác nhận hủy chặn người dùng"
      @ok="handleOk"
      @cancel="handleCancel"
      okText="Xác nhận"
      cancelText="Đóng"
    >
      <p style="font-size: 17px">
        Bạn có chắc chắn muốn hủy chặn người dùng:
        <strong>{{ selectedUser?.USERNAME }}</strong
        >?
      </p>
    </a-modal>
  </div>
  <div v-else class="denied">
    <h3 class="text-center mt-5">Vui lòng đăng nhập để xử dụng dịch vụ</h3>
  </div>
</template>

<script>
import axiosClient from "../../../api/axiosClient";
import { mapActions, mapState } from "vuex";
import { message } from 'ant-design-vue';
import _ from "lodash";
import { h } from "vue";

export default {
  computed: {
    ...mapState(["isLoggedIn"]),
  },
  data() {
    return {
      isModalVisible: false,
      okButtonProps: {
        style: {
          background: "red",
        },
      },
      isLoading: false,
      searchQuery: "",
      debouncedSearchUsers: _.debounce(this.handleSearch, 300),
      activeKey: "4",
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      allUsers: [],
      inactiveUsers: [],
      activeUsers: [],
      blockedUsers: [],
      selectedUser: null,
      allActiveUsersVisible: false,
      noResultsFound: false,

      columns: [
        {
          title: "User Name",
          dataIndex: "USERNAME",
          key: "USERNAME",
        },
        {
          title: "Full Name",
          dataIndex: "FULLNAME",
          key: "FULLNAME",
        },
        {
          title: "Giới tính",
          dataIndex: "GENDER",
          key: "GENDER",
        },
        {
          title: "Trạng thái",
          dataIndex: "STATUS",
          key: "STATUS",
          customRender: ({ record }) => {
            if (record.IS_BLOCKED) {
              return "Block";
            } else if (record.IS_ACTIVATED) {
              return "Active";
            } else {
              return "InActive";
            }
          },
        },
      ],

      columnsInactive: [
        {
          title: "User Name",
          dataIndex: "USERNAME",
          key: "USERNAME",
        },
        {
          title: "Full Name",
          dataIndex: "FULLNAME",
          key: "FULLNAME",
        },
        {
          title: "Giới tính",
          dataIndex: "GENDER",
          key: "GENDER",
        },
        {
          title: "Trạng thái",
          dataIndex: "IS_ACTIVATED",
          key: "IS_ACTIVATED",
          customRender: ({ text }) => {
            return text ? "InActive" : "InActive";
          },
        },
      ],

      columnsActive: [
        {
          title: "User Name",
          dataIndex: "USERNAME",
          key: "USERNAME",
        },
        {
          title: "Full Name",
          dataIndex: "FULLNAME",
          key: "FULLNAME",
        },
        {
          title: "Giới tính",
          dataIndex: "GENDER",
          key: "GENDER",
        },
        {
          title: "Trạng thái",
          dataIndex: "IS_ACTIVATED",
          key: "IS_ACTIVATED",
          customRender: ({ text }) => {
            return text ? "Active" : "Active";
          },
        },
      ],

      columnsBlocked: [
        // {
        //   title: "User Id",
        //   dataIndex: "_id",
        //   key: "_id",
        // },
        {
          title: "User Name",
          dataIndex: "USERNAME",
          key: "USERNAME",
        },
        {
          title: "Full Name",
          dataIndex: "FULLNAME",
          key: "FULLNAME",
        },
        {
          title: "Giới tính",
          dataIndex: "GENDER",
          key: "GENDER",
        },
        {
          title: "Trạng thái",
          dataIndex: "IS_BLOCKED",
          key: "IS_BLOCKED",
          customRender: ({ text }) => {
            return text ? "Blocked" : "Blocked";
          },
        },
        {
          title: "Actions",
          key: "actions",
          customRender: ({ record }) => {
            return h(
              "Button",
              {
                class: "unblock-button",
                type: "primary",
                onClick: () => this.showUnblockModal(record),
              },
              "Unblock"
            );
          },
        },
      ],
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    ...mapActions(['UnblockUser']),
    async handleSearch() {
      this.currentPage = 1;
      await this.fetchUsers();
    },
    async fetchUsers() {
      this.isLoading = true;
      const { activeKey, currentPage, pageSize, searchQuery } = this;
      try {
        const response = await axiosClient.get("/user/getUsers", {
          params: {
            tabStatus: activeKey,
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
          },
        });

        const { users, totalPages, totalCount } = response.data;

        this.totalCount = totalCount;

        switch (activeKey) {
          case "1":
            this.inactiveUsers = users;
            break;
          case "2":
            this.activeUsers = users;
            break;
          case "3":
            this.blockedUsers = users;
            break;
          case "4":
            this.allUsers = users;
            break;
          default:
            break;
        }

        this.noResultsFound = users.length === 0 && totalCount === 0;
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        this.isLoading = false;
      }
    },

    handleTabChange(key) {
      this.activeKey = key;
      this.currentPage = 1; // Reset lại trang hiện tại khi thay đổi tab
      this.fetchUsers();
    },

    handlePageChange(page) {
      this.currentPage = page;
      this.fetchUsers();
    },

    showUnblockModal(user) {
      this.selectedUser = user;
      this.isModalVisible = true;
    },

    async handleOk() {
      try {
        await this.UnblockUser(this.selectedUser._id);
        this.isModalVisible = false;
        this.fetchUsers();
      } catch (error) {
        console.error('Error unblocking user:', error);
        message.error('Error unblocking user');
      }
    },

    handleCancel() {
      this.isModalVisible = false;
    },

    showUserInfo(user) {
      this.selectedUser = user;
    },
    showAllActiveUsers() {
      this.allActiveUsersVisible = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./User.scss";
</style>
