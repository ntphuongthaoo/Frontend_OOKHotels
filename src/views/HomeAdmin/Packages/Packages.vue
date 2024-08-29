<template>
  <div class="package-management" v-if="isLoggedIn">
    <h2>Danh sách các gói của hệ thống</h2>
    <!-- Nút thêm gói -->
    <div class="ml-auto">
      <button v-if="isLoggedIn" @click="showModalAdd" class="btnAdd">
        Thêm gói <i class="fa-solid fa-book-open"></i>
      </button>
    </div>

    <!-- Danh sách các gói -->
    <div class="package-list">
      <div
        v-for="packageItem in packages"
        :key="packageItem._id"
        class="package-card"
      >
        <h3>
          <strong>{{ packageItem.TITLE }}</strong>
        </h3>
        <p><b>Level:</b> {{ packageItem.LEVEL }}</p>
        <p>
          <b>Giá:</b> {{ formatCurrency(packageItem.COST)
          }}<span class="vnđ">đ</span>
        </p>
        <p><b>Số lượng sản phẩm:</b> {{ packageItem.NUMBER_OF_PRODUCT }}</p>
        <p><b>Số lượt bình luận:</b> {{ packageItem.NUMBER_OF_COMMENT }}</p>
        <p><b>Mô tả:</b> {{ packageItem.DESCRIPTION }}</p>
        <p><b>Giảm giá:</b> {{ packageItem.DISCOUNT }}%</p>
        <p><b>Thời gian:</b> {{ packageItem.MONTH }} tháng</p>

        <div class="actionItem">
          <button
            v-if="isLoggedIn"
            @click="showModalUpdate(packageItem)"
            class="edit"
          >
            <i class="fa-solid fa-pen"></i> Cập nhật
          </button>

          <button
            v-if="isLoggedIn"
            @click="deletePackage(packageItem._id, packageItem.TITLE)"
            class="remove"
          >
            <i class="fa-solid fa-trash iconRemove"></i> Xóa
          </button>
        </div>
      </div>
    </div>

    <!-- Modal thêm gói -->
    <a-modal
      style="top: 40px"
      v-model:open="showAddModal"
      width="600px"
      title="Thêm gói"
      @ok="handleAddPackage"
      @cancel="handleCancel"
      :ok-button-props="{ loading: loading }"
      okText="Thêm gói"
      cancelText="Đóng"
    >
      <form @submit.prevent="handleAddPackage">
        <div class="contentModal row">
          <div class="rightModal col">
            <div class="groupForm">
              <span>Tiêu đề:</span>
              <input
                type="text"
                class="inputGroup"
                v-model="newPackage.TITLE"
                name="title"
                placeholder="Title"
                autocomplete="off"
                required
                @blur="handleValidate('TITLE')"
                @input="handleValidate('TITLE')"
              />
              <span class="error" v-if="errors.TITLE">{{ errors.TITLE }}</span>
            </div>
            <div class="groupForm">
              <span>Cấp độ:</span>
              <input
                type="number"
                class="inputGroup"
                v-model="newPackage.LEVEL"
                name="level"
                placeholder="Level"
                min="1"
                autocomplete="off"
                required
                @blur="handleValidate('LEVEL')"
                @input="handleValidate('LEVEL')"
              />
              <span class="error" v-if="errors.LEVEL">{{ errors.LEVEL }}</span>
            </div>
            <div class="groupForm">
              <span>Giá:</span>
              <input
                type="number"
                class="inputGroup"
                v-model="newPackage.COST"
                name="cost"
                placeholder="Cost"
                min="0"
                autocomplete="off"
                required
                @blur="handleValidate('COST')"
                @input="handleValidate('COST')"
              />
              <span class="error" v-if="errors.COST">{{ errors.COST }}</span>
            </div>
            <div class="groupForm">
              <span>Số lượng sản phẩm:</span>
              <input
                type="number"
                class="inputGroup"
                v-model="newPackage.NUMBER_OF_PRODUCT"
                name="numberOfProduct"
                placeholder="Number of Product"
                min="0"
                autocomplete="off"
                required
                @blur="handleValidate('NUMBER_OF_PRODUCT')"
                @input="handleValidate('NUMBER_OF_PRODUCT')"
              />
              <span class="error" v-if="errors.NUMBER_OF_PRODUCT">{{
                errors.NUMBER_OF_PRODUCT
              }}</span>
            </div>
            <div class="groupForm">
              <span>Số lượt bình luận:</span>
              <input
                type="number"
                class="inputGroup"
                v-model="newPackage.NUMBER_OF_COMMENT"
                name="numberOfComment"
                placeholder="Number of Comment"
                min="0"
                autocomplete="off"
                required
                @blur="handleValidate('NUMBER_OF_COMMENT')"
                @input="handleValidate('NUMBER_OF_COMMENT')"
              />
              <span class="error" v-if="errors.NUMBER_OF_COMMENT">{{
                errors.NUMBER_OF_COMMENT
              }}</span>
            </div>
            <div class="groupForm">
              <span>Mô tả:</span>
              <textarea
                class="inputGroup"
                v-model="newPackage.DESCRIPTION"
                name="description"
                placeholder="Description"
                autocomplete="off"
                required
                @blur="handleValidate('DESCRIPTION')"
                @input="handleValidate('DESCRIPTION')"
              ></textarea>
              <span class="error" v-if="errors.DESCRIPTION">{{
                errors.DESCRIPTION
              }}</span>
            </div>
            <div class="groupForm">
              <span>Giảm giá (%):</span>
              <input
                type="number"
                class="inputGroup"
                v-model="newPackage.DISCOUNT"
                name="discount"
                placeholder="Discount"
                min="10"
                max="50"
                autocomplete="off"
                required
                @blur="handleValidate('DISCOUNT')"
                @input="handleValidate('DISCOUNT')"
              />
              <span class="error" v-if="errors.DISCOUNT">{{
                errors.DISCOUNT
              }}</span>
            </div>
            <div class="groupForm">
              <span>Thời gian (tháng):</span>
              <input
                type="number"
                class="inputGroup"
                v-model="newPackage.MONTH"
                name="month"
                placeholder="Month"
                min="1"
                max="36"
                autocomplete="off"
                required
                @blur="handleValidate('MONTH')"
                @input="handleValidate('MONTH')"
              />
              <span class="error" v-if="errors.MONTH">{{ errors.MONTH }}</span>
            </div>
          </div>
        </div>
      </form>
    </a-modal>

    <!-- Modal xóa gói -->
    <a-modal
      style="top: 40px; font-size: 20px"
      v-model:open="isModalDelete"
      title="Xóa gói"
      @ok="handleOkDelete"
      @cancel="handleCancelDelete"
      :ok-button-props="okButtonProps"
      okText="Xác nhận"
      cancelText="Đóng"
    >
      <p style="font-size: 17px">
        Bạn có chắc muốn xóa gói: <strong>{{ selectedTitle }}</strong>
      </p>
    </a-modal>
    <!-- Modal cập nhật gói -->

    <a-modal
      v-model:open="showEditModal"
      title="Chỉnh sửa gói"
      @ok="handleEditPackage"
      @cancel="handleCancel"
      :ok-button-props="{ loading: loading }"
      okText="Lưu"
      cancelText="Hủy"
    >
      <form>
        <div class="groupForm">
          <span>Tiêu đề:</span>
          <input
            type="text"
            class="inputGroup"
            v-model="selectedPackage.TITLE"
            name="title"
            placeholder="Tiêu đề"
            autocomplete="off"
            required
          />
        </div>
        <div class="groupForm">
          <span>Cấp độ:</span>
          <input
            type="number"
            class="inputGroup"
            v-model="selectedPackage.LEVEL"
            name="level"
            placeholder="Cấp độ"
            min="1"
            autocomplete="off"
            required
            readonly
          />
        </div>
        <div class="groupForm">
          <span>Giá:</span>
          <input
            type="number"
            class="inputGroup"
            v-model="selectedPackage.COST"
            name="cost"
            placeholder="Giá"
            min="0"
            autocomplete="off"
            required
          />
        </div>
        <div class="groupForm">
          <span>Số lượng sản phẩm:</span>
          <input
            type="number"
            class="inputGroup"
            v-model="selectedPackage.NUMBER_OF_PRODUCT"
            name="numberOfProduct"
            placeholder="Số lượng sản phẩm"
            min="0"
            autocomplete="off"
            required
          />
        </div>
        <div class="groupForm">
          <span>Số lượt bình luận:</span>
          <input
            type="number"
            class="inputGroup"
            v-model="selectedPackage.NUMBER_OF_COMMENT"
            name="numberOfComment"
            placeholder="Số lượt bình luận"
            min="0"
            autocomplete="off"
            required
          />
        </div>
        <div class="groupForm">
          <span>Mô tả:</span>
          <textarea
            class="inputGroup"
            v-model="selectedPackage.DESCRIPTION"
            name="description"
            placeholder="Mô tả"
            autocomplete="off"
            required
          ></textarea>
        </div>
        <div class="groupForm">
          <span>Giảm giá (%):</span>
          <input
            type="number"
            class="inputGroup"
            v-model="selectedPackage.DISCOUNT"
            name="discount"
            placeholder="Giảm giá (%)"
            min="0"
            max="100"
            autocomplete="off"
            required
          />
        </div>
        <div class="groupForm">
          <span>Thời gian (tháng):</span>
          <input
            type="number"
            class="inputGroup"
            v-model="selectedPackage.MONTH"
            name="month"
            placeholder="Thời gian (tháng)"
            min="1"
            autocomplete="off"
            required
          />
        </div>
        <!-- Thêm các trường chỉnh sửa khác nếu cần -->
      </form>
    </a-modal>
  </div>
  <div v-else class="denied">
    <h3 class="text-center mt-5">Vui lòng đăng nhập để xử dụng dịch vụ</h3>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axiosClient from "../../../api/axiosClient";
import { message } from "ant-design-vue";
import { useStore } from "vuex";
export default {
  computed: {
    ...mapState(["isLoggedIn", "packages", "deletedPackages"]),
    levels() {
      return this.packages.map((pkg) => pkg.LEVEL);
    },
    hiddenLevels() {
      return this.deletedPackages.map((pkg) => pkg.LEVEL);
    },
  },
  data() {
    return {
      showAddModal: false,
      loading: false,
      showUpdateModal: false,
      selectedPackage: {},
      showEditModal: false,
      isModalDelete: false,
      newPackage: {
        TITLE: "",
        LEVEL: "",
        COST: "",
        NUMBER_OF_PRODUCT: "",
        NUMBER_OF_COMMENT: "",
        DESCRIPTION: "",
        DISCOUNT: "",
        MONTH: "",
      },
      activeInputId: null,
      errors: {
        TITLE: "",
        LEVEL: "",
        COST: "",
        NUMBER_OF_PRODUCT: "",
        NUMBER_OF_COMMENT: "",
        DESCRIPTION: "",
        DISCOUNT: "",
        MONTH: "",
      },
      okButtonProps: {
        style: {
          background: "red",
        },
      },
    };
  },
  mounted() {
    this.$store.dispatch("fetchPackages");
  },
  methods: {
    formatCurrency(value) {
      const formattedValue = parseFloat(value)
        .toFixed(0)
        .replace(/\d(?=(\d{3})+$)/g, "$&.");
      return formattedValue;
    },
    showModalAdd() {
      this.showAddModal = true;
    },
    // showModalUpdate(packageItem) {
    //   this.showEditModal = true;
    //   this.selectedPackage = packageItem;
    // },
    showModalUpdate(packageItem) {
      this.showEditModal = true;
      // Tạo một bản sao sâu của packageItem
      this.selectedPackage = JSON.parse(JSON.stringify(packageItem));
    },
    async handleEditPackage() {
      try {
        await this.$store.dispatch("updatePackage", this.selectedPackage);
        this.loading = true;
        this.showEditModal = false;
      } catch (error) {
        console.error("Error updating package:", error);
        message.error("Lỗi khi cập nhật gói: " + error.message);
        this.loading = false;
      }
    },
//     async handleEditPackage() {
//       this.loading = true;
//       try {
//         const response = await this.$store.dispatch("updatePackage", this.selectedPackage);
//         if (response.success) {
//           // Cập nhật lại danh sách gói
//           await this.$store.dispatch("fetchPackages");
//           this.showEditModal = false;
//           this.loading = false;
//           message.success("Cập nhật gói thành công!");
//         } else {
//           message.error("Lỗi khi cập nhật gói.");
//           this.loading = false;
//         }
//       } catch (error) {
//         console.error("Error updating package:", error);
//         message.error("Lỗi khi cập nhật gói.");
//         this.loading = false;
//       }
// },
    // handleCancelEdit () {
    // 	this.showModalUpdate = false;
    // },

    handleValidate(field) {
      const {
        TITLE,
        LEVEL,
        COST,
        NUMBER_OF_PRODUCT,
        NUMBER_OF_COMMENT,
        DESCRIPTION,
        DISCOUNT,
        MONTH,
      } = this.newPackage;

      switch (field) {
        case "TITLE":
          this.errors.TITLE = TITLE.trim() ? "" : "Vui lòng nhập tiêu đề";
          break;
        case "LEVEL":
          // Kiểm tra xem level có hợp lệ không
          const isValidLevel = LEVEL > 0;
          // Kiểm tra xem level đã tồn tại trong danh sách levels không
          const isDuplicateLevel = this.levels.includes(parseInt(LEVEL));
          const isHiddenLevel = this.hiddenLevels.includes(parseInt(LEVEL));

          // Thiết lập thông báo lỗi dựa trên điều kiện
          if (!isValidLevel) {
            this.errors.LEVEL = "Vui lòng nhập level";
          } else if (isDuplicateLevel || isHiddenLevel) {
            this.errors.LEVEL = "Level đã tồn tại";
          } else {
            this.errors.LEVEL = ""; // Thiết lập thành rỗng nếu không có lỗi
          }
          break;
        case "COST":
          this.errors.COST = COST > 0 ? "" : "Giá phải lớn hơn 0";
          break;
        case "NUMBER_OF_PRODUCT":
          this.errors.NUMBER_OF_PRODUCT =
            NUMBER_OF_PRODUCT > 0 ? "" : "Vui lòng nhập số lượng sản phẩm";
          break;
        case "NUMBER_OF_COMMENT":
          this.errors.NUMBER_OF_COMMENT =
            NUMBER_OF_COMMENT > 0 ? "" : "Vui lòng nhập số lượt bình luận";
          break;
        case "DESCRIPTION":
          this.errors.DESCRIPTION = DESCRIPTION.trim()
            ? ""
            : "Vui lòng nhập mô tả";
          break;
        case "DISCOUNT":
          this.errors.DISCOUNT =
            DISCOUNT >= 10 && DISCOUNT <= 50
              ? ""
              : "Giảm giá phải trong khoảng từ 10 đến 50";
          break;
        case "MONTH":
          this.errors.MONTH =
            MONTH >= 1 && MONTH <= 36 ? "" : "Thời gian phải từ 1 đến 36 tháng";
          break;
        default:
          break;
      }
    },

    async handleAddPackage() {
      for (const field in this.newPackage) {
        this.handleValidate(field);
      }

      // Kiểm tra xem có lỗi không
      if (Object.values(this.errors).some((error) => error)) {
        console.log(this.errors);
        return;
      }
      this.loading = true;
      try {
        const response = await axiosClient.post(
          "/package/create",
          this.newPackage
        );
        console.log("Package created:", response.data);
        if (response.data.success) {
          this.$store.dispatch("fetchPackages");
          this.resetForm();
          this.showAddModal = false;
          this.loading = false;
          message.success("Thêm gói thành công!");
        } else {
          const { errors } = response.data;
          if (errors && errors.length > 0) {
            errors.forEach((error) => {
              message.error(error);
            });
          } else {
            message.error("Lỗi khi thêm gói.");
          }
        }
      } catch (error) {
        console.error("Error creating package:", error);
        this.loading = false;
        message.error("Lỗi khi thêm gói.");
      }
    },
    async deletePackage(packageId, packageTitle) {
      try {
        this.selectedTitle = packageTitle;
        this.isModalDelete = true;
        this.selectedPackage = packageId;
      } catch (error) {
        console.error("Error deleting package:", error);
      }
    },
    async handleOkDelete() {
      try {
        await this.$store.dispatch("deletePackage", this.selectedPackage);
        this.isModalDelete = false;
      } catch (error) {
        console.error("Error deleting package:", error);
      }
    },
    handleCancelDelete() {
      this.isModalDelete = false;
    },
    handleCancel() {
      this.showAddModal = false;
      this.resetForm();
    },
    resetForm() {
      this.newPackage = {
        TITLE: "",
        LEVEL: 1,
        COST: 0,
        NUMBER_OF_PRODUCT: 0,
        NUMBER_OF_COMMENT: 0,
        DESCRIPTION: "",
        MONTH: 0,
        DISCOUNT: 0,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./Packages.scss";
</style>
