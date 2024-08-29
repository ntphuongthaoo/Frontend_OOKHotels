<template>
	<div>
	  <div class="container mt-5">
		<div class="row">
		  <div class="col-md-4">
			<div class="card">
			  <div class="card-body">
				<h5 class="card-title">Tổng số tổ chức</h5>
				<p class="card-text">{{ totalOrganizations }}</p>
			  </div>
			</div>
		  </div>
		  <div class="col-md-4">
			<div class="card">
			  <div class="card-body">
				<h5 class="card-title">Tổng số người dùng</h5>
				<p class="card-text">{{ totalUsers }}</p>
			  </div>
			</div>
		  </div>
		  <div class="col-md-4">
			<div class="card">
			  <div class="card-body">
				<h5 class="card-title">Hoạt động gần đây</h5>
				<p class="card-text">{{ recentActivity }}</p>
			  </div>
			</div>
		  </div>
		</div>
		<div class="row mt-5">
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-body">
				<h5 class="card-title">Biểu đồ số lượng tổ chức và người dùng</h5>
				<canvas id="orgUserChart"></canvas>
			  </div>
			</div>
		  </div>
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-body">
				<h5 class="card-title">Biểu đồ hoạt động gần đây</h5>
				<canvas id="recentActivityChart"></canvas>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	</div>
  </template>
  
  <script>
  import Chart from 'chart.js/auto';
  
  export default {
	data() {
	  return {
		totalOrganizations: 0,
		totalUsers: 0,
		recentActivity: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
		orgUserChart: null,
		recentActivityChart: null
	  };
	},
	mounted() {
	  // Simulate fetching data from API
	  this.totalOrganizations = 50;
	  this.totalUsers = 100;
  
	  // Simulate recent activity
	  this.recentActivity = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec rutrum nunc vitae sem tristique, ac convallis eros hendrerit. Integer convallis tellus a mi pulvinar, at faucibus justo eleifend. Duis laoreet vestibulum purus, et fermentum quam placerat at.";
  
	  // Draw charts
	  this.drawOrgUserChart();
	  this.drawRecentActivityChart();
	},
	methods: {
	  drawOrgUserChart() {
		const ctx = document.getElementById('orgUserChart').getContext('2d');
		this.orgUserChart = new Chart(ctx, {
		  type: 'bar',
		  data: {
			labels: ['Tổ chức', 'Người dùng'],
			datasets: [{
			  label: 'Số lượng',
			  data: [this.totalOrganizations, this.totalUsers],
			  backgroundColor: [
				'rgba(54, 162, 235, 0.2)',
				'rgba(255, 99, 132, 0.2)'
			  ],
			  borderColor: [
				'rgba(54, 162, 235, 1)',
				'rgba(255, 99, 132, 1)'
			  ],
			  borderWidth: 1
			}]
		  },
		  options: {
			scales: {
			  y: {
				beginAtZero: true
			  }
			}
		  }
		});
	  },
	  drawRecentActivityChart() {
		const ctx = document.getElementById('recentActivityChart').getContext('2d');
		this.recentActivityChart = new Chart(ctx, {
		  type: 'line',
		  data: {
			labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			datasets: [{
			  label: 'Hoạt động gần đây',
			  data: [12, 19, 3, 5, 2, 3, 10],
			  fill: false,
			  borderColor: 'rgb(75, 192, 192)',
			  tension: 0.1
			}]
		  }
		});
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Custom styles can be added here */
  </style>
  