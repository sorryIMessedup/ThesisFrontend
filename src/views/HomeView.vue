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
  background-color: white;
  box-shadow: inset 0px -1px 5px gray;
  color: rgb(183, 0, 49);
  display: flex;
  height: 80px;
}

.el-aside {
  background-color: rgb(83,89,94);
  color: white;
}

.el-main {
  background-color: #eaedf1;
}
</style>