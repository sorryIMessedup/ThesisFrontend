<template>
  <el-card>
    <h1>查询某位导师的所有学生</h1>
    请选择导师：
    <el-select v-model="value" placeholder="导师" size="large" style="width: 240px">
      <el-option v-for="item in tableData1" :key="item.uid" :label="item.username" :value="item.uid" />
    </el-select> &nbsp;
    <el-button size="large" type="primary" @click="doQuerry">查询</el-button>
    <el-divider></el-divider>
    <el-table stripe :data="tableData2.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="" :border="false">
      <el-table-column fixed prop="uid" label="学生ID" width="100" />
      <el-table-column prop="username" label="用户名" width="200" />
      <el-table-column prop="access" label="状态" width="60" />
    </el-table>
    <br>
    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
      layout="sizes, prev, pager, next" :total="tableData2.length" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </el-card>
  <el-divider />
</template>

<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';

const tableData1 = ref([])
const tableData2 = ref([])
const value = ref('')

const pageNum = ref(1)
const pageSize = ref(10)

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
}

const init = () => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'get',
    url: '/api/teacher/get_all',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    tableData1.value = res.data.teacher_list
    console.log(res)
  }, err => {
    ElMessage.error('获取所有导师失败')
    console.log(err)
  })
}

const doQuerry = () => {
  if (value.value == '') {
    ElMessage.warning('请先选择导师！')
    return
  }
  console.log(value.value)
  let token = window.localStorage.getItem('token')
  axios({
    method: 'get',
    url: '/api/teacher/get_all_student',
    params: {
      teacher_id: value.value
    },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    ElMessage.success('获取该导师的所有学生成功')
    for (let item of res.data.student_list) {
      if (item.access === 1) item.access = '可用'
      if (item.authority === 0) item.authority = '学生'
      if (item.authority === 1) item.authority = '导师'
      if (item.authority === 2) item.authority = '教务员'
      if (item.authority === 3) item.authority = '领导'
    }
    tableData2.value = res.data.student_list
    console.log(res)
  }, err => {
    ElMessage.error('获取该导师的所有学生失败')
    console.log(err)
  })
}

onMounted(() => {
  init()
})
</script>

<style scoped></style>
