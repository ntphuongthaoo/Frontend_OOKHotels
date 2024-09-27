<template>
    <div class="product-page">
      <!-- Banner Section -->
      <div class="carousel">
        <div class="carousel-inner">
          <div v-for="(banner, index) in banners" :key="index" class="carousel-item" :class="{ active: index === currentIndex }">
            <img :src="banner" alt="Banner" />
          </div>
        </div>
      </div>
  
      <!-- Products Section -->
      <div class="products">
        <div v-for="product in products" :key="product.id" class="product-card">
          <img :src="product.image" :alt="product.name" />
          <h3>{{ product.name }}</h3>
          <p>{{ product.price }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import bannerProduct from '@/assets/bg_1.jpg';
  import bannerProduct1 from '@/assets/bg_2.jpg';
  import bannerProduct2 from '@/assets/bg_3.jpg';
  
  export default {
    data() {
      return {
        banners: [
          bannerProduct,
          bannerProduct1,
          bannerProduct2
        ],
        currentIndex: 0,
      };
    },
    mounted() {
      this.startCarousel();
    },
    methods: {
      startCarousel() {
        const items = document.querySelectorAll('.carousel-item');
        this.currentIndex = 0; // Set the initial index to show the first item
  
        setInterval(() => {
          items[this.currentIndex].classList.remove('active');
          this.currentIndex = (this.currentIndex + 1) % items.length;
          items[this.currentIndex].classList.add('active');
        }, 5000); // Change every 5 seconds
      }
    }
  };
  </script>
  
  <style scoped>
  .product-page {
    text-align: center;
  }
  
  .carousel {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  
  .carousel-inner {
    display: flex;
    transition: transform 0.5s ease;
  }
  
  .carousel-item {
    min-width: 100%;
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  .carousel-item img {
    width: 100%;
    height: auto;
  }
  
  .carousel-item.active {
    opacity: 1;
  }
  
  .products {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    margin-top: 20px;
  }
  
  .product-card {
    border: 1px solid #ddd;
    padding: 10px;
    margin: 10px;
    width: 200px;
  }
  
  .product-card img {
    width: 100%;
    height: auto;
  }
  
  .product-card h3 {
    font-size: 18px;
    margin: 10px 0;
  }
  
  .product-card p {
    font-size: 16px;
    color: #333;
  }
  </style>