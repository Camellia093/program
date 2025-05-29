<script setup>
import Seasons from './components/Seasons.vue'
</script>

<template>
  <div id="app">
    <Seasons />
  </div>
</template>

<style>
#app {
  width: 100%;
  min-height: 100vh;
  background-image: url('./assets/background_light.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  position: relative;
  transition: background-image 0.7s ease-in-out;
  overflow-x: hidden;
}
</style>
