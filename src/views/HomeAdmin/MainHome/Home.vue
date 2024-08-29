<template>
  <div class="containPage" v-if="isLoggedIn">
    <h2>Dashboard</h2>
    <div class="contentPage">
      <div class="listCard">
        <div class="row pl-3">
          <div class="col">
            <div class="cardInfo">
              <div class="leftCard">
                <div class="iconCard">
                  <i class="fa-solid fa-user" style="color: #bc7af9"></i>
                  <!-- <i class="fa-solid fa-cart-shopping"></i> -->
                </div>
              </div>
              <div class="rightCard">
                <div class="numberCard">
                  {{ totalUser }}
                </div>
                <div class="nameCard">Tổng số User</div>
              </div>
            </div>
          </div>
          <div class="col d-flex">
            <div class="cardInfo">
              <div class="leftCard">
                <div class="iconCard" style="background-color: #cdf1ef">
                  <i class="fa-solid fa-user-tie" style="color: #05b9aa"></i>
                </div>
              </div>
              <div class="rightCard">
                <div class="numberCard">
                  {{ totalOrganization }}
                </div>
                <div class="nameCard">Tổng số tổ chức</div>
              </div>
            </div>
          </div>
          <div class="col d-flex">
            <div class="cardInfo">
              <div class="leftCard">
                <div class="iconCard" style="background-color: #cbe2ff">
                  <!-- <i
					  class="fa-solid fa-hourglass-half"
					  style="color: #007bff"
					></i> -->
                  <i
                    class="fa-solid fa-boxes-packing"
                    style="color: #007bff"
                  ></i>
                </div>
              </div>
              <div class="rightCard">
                <div class="numberCard">
                  {{ totalPackages }}
                </div>
                <div class="nameCard">Tổng số gói</div>
              </div>
            </div>
          </div>
          <div class="col d-flex">
            <div class="cardInfo">
              <div class="leftCard">
                <div class="iconCard" style="background-color: #cbd08b">
                  <!-- <i class="fa-solid fa-user-tie" style="color: #05b9aa"></i> -->
                  <i class="fa-solid fa-dollar-sign" style="color: #b9ad05"></i>
                </div>
              </div>
              <div class="rightCard">
                <div class="numberCard">
                  {{ totalRevenue }}
                </div>
                <div class="nameCard">Tổng doanh thu</div>
              </div>
            </div>
          </div>
          <!-- <div class="col d-flex">
			  <div class="cardInfo">
				<div class="leftCard">
				  <div class="iconCard" style="background-color: #e5cff7">
					<i class="fa-solid fa-user" style="color: #bc7af9"></i>
				  </div>
				</div>
				<div class="rightCard">
				  <div class="numberCard">
					{{ totalCustomer }}
				  </div>
				  <div class="nameCard">Tổng độc giả</div>
				</div>
			  </div>
			</div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from "../../../api/axiosClient";
import { mapState } from "vuex";

export default {
  data() {
    return {
      totalUser: 0,
      totalOrganization: 0,
      totalPackages: 0,
      totalRevenue: 0,
    };
  },
  mounted() {
    this.fetchDashboardData();
  },
  computed: {
    ...mapState(["isLoggedIn"]),
  },

  methods: {
    fetchDashboardData() {
      axiosClient
        .get("/user/getDashboardData")
        .then((response) => {
          this.totalUser = response.data.totalUser;
          this.totalOrganization = response.data.totalOrganization;
          this.totalPackages = response.data.totalPackages;
          this.totalRevenue = response.data.totalRevenue;
        })
        .catch((error) => {
          console.error("Error fetching total users:", error);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "Home.scss";
</style>
