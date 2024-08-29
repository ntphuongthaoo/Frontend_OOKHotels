<!-- <template>
  <div>
    <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button
          v-for="(image, index) in images"
          :key="index"
          :data-bs-target="'#carouselExampleIndicators'"
          :data-bs-slide-to="index"
          :class="{ active: index === 0 }"
          :aria-label="'Slide ' + (index + 1)"
        ></button>
      </div>
      <div class="carousel-inner">
        <div v-for="(image, index) in images" :key="index" :class="['carousel-item', { active: index === 0 }]">
          <img :src="image.src" class="d-block w-100" :alt="image.alt">
          <div class="carousel-caption d-none d-md-block">
            <h5>{{ image.title }}</h5>
            <p>{{ image.description }}</p>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
    
    <div class="search-bar">
      <input type="text" placeholder="Điểm đến hoặc tên khách sạn" v-model="destination" />
      <input type="date" placeholder="Ngày nhận phòng" v-model="checkInDate" />
      <input type="date" placeholder="Ngày trả phòng" v-model="checkOutDate" />
      <input type="number" placeholder="Người lớn" v-model="adults" min="1" />
      <input type="number" placeholder="Trẻ em" v-model="children" min="0" />
      <button class="search-btn" @click="searchRooms">Tìm kiếm</button>
    </div>
  </div>
</template>

<script>
import bg1 from '@/assets/bg_1.jpg';
import bg2 from '@/assets/bg_2.jpg';
import bg3 from '@/assets/bg_3.jpg';

export default {
  name: "BannerComponent",
  data() {
    return {
      destination: '',
      checkInDate: '',
      checkOutDate: '',
      adults: 1,
      children: 0,
      images: [
        {
          src: bg1,
          alt: 'Hotel Image 1',
          title: 'Hotel Luxury 1',
          description: 'Experience the luxury stay at our first hotel.'
        },
        {
          src: bg2,
          alt: 'Hotel Image 2',
          title: 'Hotel Luxury 2',
          description: 'Enjoy the comfort and beauty at our second hotel.'
        },
        {
          src: bg2,
          alt: 'Hotel Image 3',
          title: 'Hotel Luxury 3',
          description: 'Relax and unwind at our stunning third hotel.'
        }
      ]
    };
  },
  methods: {
    searchRooms() {
      console.log({
        destination: this.destination,
        checkInDate: this.checkInDate,
        checkOutDate: this.checkOutDate,
        adults: this.adults,
        children: this.children,
      });
    },
  },
};
</script>

<style scoped>
.carousel-item {
  height: 80vh;
  background-size: cover;
  background-position: center;
}
.carousel-caption {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
}

.search-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.search-bar input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.search-bar .search-btn {
  background-color: #2d98da;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-bar .search-btn:hover {
  background-color: #1b74a1;
}
</style> -->
