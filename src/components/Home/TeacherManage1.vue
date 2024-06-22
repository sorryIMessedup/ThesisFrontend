<template>
  <el-card>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <h1>查看所有导师</h1>
      <span>共 {{ tableData.length }} 名导师&nbsp;&nbsp;&nbsp;&nbsp;</span>
    </div>
    <span>所有导师的信息会被列举在这里。</span>
    <el-divider></el-divider>
    <el-table stripe :data="tableData.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="" :border="false">
      <el-table-column fixed prop="uid" label="导师ID" width="100" />
      <el-table-column prop="username" label="用户名" width="200" />
      <el-table-column prop="access" label="可用" />
    </el-table>
    <br>
    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
      layout="sizes, prev, pager, next" :total="tableData.length" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </el-card>
  <el-divider />
</template>

<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
}

onMounted(() => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'get',
    url: '/api/teacher/get_all',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    ElMessage.success('获取所有导师成功')
    for (let item of res.data.teacher_list) {
      if (item.access === 1) item.access = '可用'
      if (item.authority === 0) item.authority = '学生'
      if (item.authority === 1) item.authority = '导师'
      if (item.authority === 2) item.authority = '教务员'
      if (item.authority === 3) item.authority = '领导'
    }
    tableData.value = res.data.teacher_list
    console.log(res)
  }, err => {
    ElMessage.error('获取所有导师失败')
    console.log(err)
  })
})
</script>

<style scoped></style>