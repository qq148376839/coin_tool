<script setup lang="ts">
</script>

<template>
  <div id="main">
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
#main {
  width: 100%;
  max-width: 100%;
  min-width: 800px;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: #d3eaff22;
  margin: 0 auto;
}
</style>

<style lang="scss">
body, #app {
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
