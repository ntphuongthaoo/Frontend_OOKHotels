<template>
    <div class="chat-layout">
      <header v-if="isAdminOrStaff" class="chat-header">
        <h2>Admin Chat Dashboard</h2>
      </header>
      <main class="chat-content">
        <Chat />
      </main>
    </div>
  </template>
  
  <script>
  import Chat from '../../components/Chat/Chat.vue';
  import { mapState } from 'vuex';
  
  export default {
    name: 'ChatLayout',
    components: {
      Chat,
    },
    computed: {
      ...mapState(['userInfo']),
      isAdminOrStaff() {
        return this.userInfo?.ROLE?.ADMIN || this.userInfo?.ROLE?.STAFF;
      },
    },
  };
  </script>
  
  <style scoped>
  .chat-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .chat-header {
    background-color: #7274ff;
    color: white;
    padding: 1rem;
    text-align: center;
  }
  
  .chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
  </style>
  