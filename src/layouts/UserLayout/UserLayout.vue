<template>
    <div class="app">
      <div class="d-block w-100">
        <Header />
        <router-view />
      </div>
    </div>
  </template>
  <script setup>
  import Header from "../../components/NavbarUser/NavbarUser.vue";
  </script>