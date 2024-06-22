<template>
  <div class="container">
    <div class="box">
      <RouterView />
    </div>
  </div>
</template>

<script>
import { RouterView } from 'vue-router';
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  background-color: gray;
  height: 100vh;
}

.box {
  padding-top: 10vh;
  width: 60vw;
}
</style>