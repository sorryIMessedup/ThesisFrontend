<template>
  <el-card>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <h1>用户管理</h1>
      <span>共 {{ tableData.length }} 名用户&nbsp;&nbsp;&nbsp;&nbsp;</span>
    </div>
    <el-table stripe :data="tableData.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="min-width: 1200px;" :border="false">
      <el-table-column fixed prop="uid" label="ID" width="100" />
      <el-table-column prop="username" label="用户名" width="200" />
      <el-table-column prop="access" label="状态" width="80" />
      <el-table-column prop="authority" label="权限" width="80" />
      <el-table-column prop="" label="操作">
        <template #default="scope">
          <el-button type="danger" @click="ban(scope.row)" :disabled="scope.row.access == '禁用'">停用</el-button>
          <el-button type="primary" @click="unban(scope.row)" :disabled="scope.row.access == '可用'">复用</el-button>
        </template>
      </el-table-column>
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

const ban = (row: any) => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'post',
    url: '/api/user/ban',
    params: {
      uid: row.uid,
      authority: 3
    },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    ElMessage.success('禁用成功')
    row.access = '禁用'
    console.log(res)
  }, err => {
    ElMessage.error('禁用失败')
    console.log(err)
  })
}

const unban = (row: any) => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'post',
    url: '/api/user/unban',
    params: {
      uid: row.uid,
      authority: 3
    },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    ElMessage.success('复用成功')
    row.access = '可用'
    console.log(res)
  }, err => {
    ElMessage.error('复用失败')
    console.log(err)
  })
}

onMounted(() => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'get',
    url: '/api/user/getall',
    params: {
      page: 1,
      pageSize: 5
    },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    ElMessage.success('获取所有用户成功')
    for (let item of res.data.user_list) {
      if (item.access === 1) item.access = '可用'
      if (item.access === 0) item.access = '禁用'
      if (item.authority === 0) item.authority = '学生'
      if (item.authority === 1) item.authority = '导师'
      if (item.authority === 2) item.authority = '教务员'
      if (item.authority === 3) item.authority = '领导'
    }
    tableData.value = res.data.user_list
    console.log(res)
  }, err => {
    ElMessage.error('获取所有学生失败')
    console.log(err)
  })
})
</script>

<style scoped></style>