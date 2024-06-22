<template>
  <el-aside width="220px">
    <div>
      <el-menu default-active="/home/studentManage" class="el-menu-vertical-demo" @open="handleOpen"
        @close="handleClose" router>

        <el-sub-menu index="">
          <template #title>
            <el-icon>
              <ChatLineSquare />
            </el-icon>
            <span>导师申请管理</span>
          </template>
          <el-menu-item index="/home/applicationManage1" :disabled="auth != '0'">- 我的导师申请</el-menu-item>
          <el-menu-item index="/home/applicationManage2" :disabled="auth != '1'">- 申请我的学生</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="">
          <template #title>
            <el-icon>
              <Calendar />
            </el-icon>
            <span>开题报告管理</span>
          </template>
          <el-menu-item index="/home/proposalManage1" :disabled="auth != '0'">- 我的开题报告</el-menu-item>
          <el-menu-item index="/home/proposalManage2" :disabled="auth != '1'">- 我审批的开题报告</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="">
          <template #title>
            <el-icon>
              <Document />
            </el-icon>
            <span>论文管理</span>
          </template>
          <el-menu-item index="/home/thesisManage1" :disabled="auth != '0'">- 提交论文</el-menu-item>
          <el-menu-item index="/home/thesisManage2" :disabled="auth != '1' && auth != '2'">- 审批论文</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="">
          <template #title>
            <el-icon>
              <CoffeeCup />
            </el-icon>
            <span>导师查询</span>
          </template>
          <el-menu-item index="/home/teacherManage1">- 查询所有导师</el-menu-item>
          <el-menu-item index="/home/teacherManage2">- 查询某导师的所有学生</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/home/studentManage" :disabled="auth == '0'">
          <el-icon>
            <DataBoard />
          </el-icon>
          <span>查看所有学生</span>
        </el-menu-item>
        <el-menu-item index="/home/userManage" :disabled="auth != '3'">
          <el-icon>
            <User />
          </el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div style="position: absolute; bottom: 10px; left: 50px;">
      <div style="position: relative; text-align: center; padding-bottom: 20px; left: -20px; color: white;">
        <div>{{ date }} {{ time }}</div>
        <span>欢迎您，</span>
        <span v-if="auth == '0'">同学</span>
        <span v-if="auth == '1'">导师</span>
        <span v-if="auth == '2'">教务员</span>
        <span v-if="auth == '3'">管理员</span>
      </div>
      <el-button size="large" @click="quit"> 退出登录</el-button>
    </div>
  </el-aside>
</template>

<script lang="ts" setup>
import { CoffeeCup, DataBoard, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'

const auth = ref('')
const date = ref('')
const time = ref('')

onMounted(() => {
  var currentTime = new Date()
  date.value = currentTime.toLocaleDateString()
  time.value = currentTime.toLocaleTimeString()
  setInterval(() => {
    currentTime = new Date()
    date.value = currentTime.toLocaleDateString()
    time.value = currentTime.toLocaleTimeString()
  }, 1000)
  auth.value = window.localStorage.getItem('auth')
})

const quit = () => {
  ElMessage.success('退出成功')
  window.localStorage.clear()
  router.push('/login')
}

const router = useRouter()
const handleOpen = (key: string, keyPath: string[]) => {
  console.log('open' + key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log('close' + key, keyPath)
}
</script>

<style scoped>
.el-menu {
  --el-menu-bg-color: #53595E;
  --el-menu-hover-bg-color: rgb(63, 68, 72);
  --el-menu-text-color: rgb(204, 205, 207);
  --el-menu-active-color: white;
}

.el-menu-item {
  color: white;
}
</style>