<template>
    <div class="app">
      <div class="d-block w-100">
        <Header />
        <router-view />
        <Footer />
      </div>
    </div>
  </template>
  <script setup>
  import Header from "../../components/NavbarUser/NavbarUser.vue";
  import Footer from "../../components/Footer/Footer.vue"
  // import Chat from "../../components/ChatRealTime/ChatRealTime.vue"
  </script>