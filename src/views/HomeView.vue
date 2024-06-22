<template>
  <el-container class="home-container">
    <el-header><Header></Header></el-header>
    <el-container>
      <Aside></Aside>
      <el-main><RouterView /></el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import Header from '../components/Home/Header.vue'
import Aside from '../components/Home/Aside.vue'
import { RouterView } from 'vue-router'
</script>

<style scoped>
.home-container {
  height: 100vh;
}

.el-header {
  display: flex;
  align-items: center;
  background-color: #373D41;
  color: white;
  display: flex;
  height: 80px;
}

.el-aside {
  background-color: #333744;
}

.el-main {
  background-color: #eaedf1;
}
</style>