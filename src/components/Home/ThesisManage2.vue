<template>
  <el-card>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <h1 v-if="auth == '1'">审批论文 (导师)</h1>
      <h1 v-else>审批论文 (教务)</h1>
    </div>
    <span v-if="auth == '1'">您应对您的学生的论文进行审批，通过审批的论文将进入教务审批。</span>
    <span v-else>通过导师审批的论文将在这里，您将进行论文最后的审批。</span>
    <el-divider />
    <el-table stripe :data="thesisData.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="" :border="false">
      <el-table-column fixed prop="thesisId" label="论文ID" width="100" />
      <el-table-column prop="studentId" label="学生ID" width="100" />
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="teacherPass" label="状态" width="100" v-if="auth == '1'" />
      <el-table-column prop="deanPass" label="状态" width="100" v-if="auth == '2'" />
      <el-table-column prop="" label="操作" min-width="270" v-if="auth == '1'">
        <template #default="scope">
          <el-button type="primary" @click="agree(scope.row)" :disabled="scope.row.teacherPass == '已通过' || !canApply1">通过</el-button>
          <el-button type="danger" @click="refuse(scope.row)" :disabled="scope.row.teacherPass == '已拒绝' || !canApply1">拒绝</el-button>
          <el-button type="default" @click="download(scope.row)">下载论文</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="" label="操作" min-width="270" v-if="auth == '2'">
        <template #default="scope">
          <el-button type="primary" @click="agree(scope.row)" :disabled="scope.row.deanPass == '已通过' || !canApply2">通过</el-button>
          <el-button type="danger" @click="refuse(scope.row)" :disabled="scope.row.deanPass == '已拒绝' || !canApply2">拒绝</el-button>
          <el-button type="default" @click="download(scope.row)">下载论文</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
      layout="sizes, prev, pager, next" :total="thesisData.length" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </el-card>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const thesisData = ref([])
const auth = ref('')
const pageNum = ref(1)
const pageSize = ref(5)
const canApply1 = ref(true)
const canApply2 = ref(true)

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
}

const init = () => {
  let token = window.localStorage.getItem('token')
  if (auth.value == '1') {
    axios({
      method: 'get',
      url: '/api/thesis/get_by_teacher',
      params: { teacher_id: window.localStorage.getItem('uid') },
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(function (res) {
      ElMessage.success('获取所有申请成功')
      for (let item of res.data.thesis_list) {
        if (item.teacherPass === 0) item.teacherPass = '未处理'
        if (item.teacherPass === 1) item.teacherPass = '已通过'
        if (item.teacherPass === 2) item.teacherPass = '已拒绝'
        if (item.deanPass === 0) item.deanPass = '未处理'
        if (item.deanPass === 1) item.deanPass = '已通过'
        if (item.deanPass === 2) item.deanPass = '已拒绝'
      }
      thesisData.value = res.data.thesis_list
      console.log(res)
    }, err => {
      ElMessage.error('获取所有申请失败')
      console.log(err)
    })
  }
  else if (auth.value == '2') {
    axios({
      method: 'get',
      url: '/api/thesis/get_by_teacher_pass',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(function (res) {
      ElMessage.success('获取所有申请成功')
      for (let item of res.data.thesis_list) {
        if (item.teacherPass === 0) item.teacherPass = '未处理'
        if (item.teacherPass === 1) item.teacherPass = '已通过'
        if (item.teacherPass === 2) item.teacherPass = '已拒绝'
        if (item.deanPass === 0) item.deanPass = '未处理'
        if (item.deanPass === 1) item.deanPass = '已通过'
        if (item.deanPass === 2) item.deanPass = '已拒绝'
      }
      thesisData.value = res.data.thesis_list
      console.log(res)
    }, err => {
      ElMessage.error('获取所有申请失败')
      console.log(err)
    })
  }
  else alert('Error!')
  let currentDate = new Date()
  let applicationEndDate = new Date('2024-04-17T00:00:01')
  if (currentDate > applicationEndDate) {
    canApply1.value = false
  }
  applicationEndDate = new Date('2024-04-25T00:00:01')
  if (currentDate > applicationEndDate) {
    canApply2.value = false
  }
  if (!canApply1.value || !canApply2.value)
    ElMessageBox.alert('您已超过时限，无法审批论文了！', '警告', {
      confirmButtonText: 'OK',
    })
}

const agree = (row: any) => {
  let token = window.localStorage.getItem('token')
  if (auth.value == '1') {
    axios({
      method: 'post',
      url: '/api/thesis/pass_by_teacher',
      params: { thesis_id: row.thesisId },
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(function (res) {
      ElMessage.success('通过成功')
      row.teacherPass = '已通过'
      console.log(res)
    }, err => {
      ElMessage.error('通过失败')
      console.log(err)
    })
  }
  else {
    axios({
      method: 'post',
      url: '/api/thesis/pass_by_dean',
      params: { thesis_id: row.thesisId },
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(function (res) {
      if (res.data.error_message != 'success') {
        ElMessage.success(res.data.error_message)
        console.log(res)
      }
      else {
        ElMessage.success('通过成功')
        row.deanPass = '已通过'
        console.log(res)
      }
    }, err => {
      ElMessage.error('通过失败')
      console.log(err)
    })
  }
}

const refuse = (row: any) => {
  let token = window.localStorage.getItem('token')
  if (auth.value == '1') {
    axios({
      method: 'post',
      url: '/api/thesis/refuse_by_teacher',
      params: { thesis_id: row.thesisId },
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(function (res) {
      ElMessage.success('拒绝成功')
      row.teacherPass = '已拒绝'
      console.log(res)
    }, err => {
      ElMessage.error('拒绝失败')
      console.log(err)
    })
  }
  else {
    axios({
      method: 'post',
      url: '/api/thesis/refuse_by_dean',
      params: { thesis_id: row.thesisId },
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(function (res) {
      ElMessage.success('拒绝成功')
      row.deanPass = '已拒绝'
      console.log(res)
    }, err => {
      ElMessage.error('拒绝失败')
      console.log(err)
    })
  }
}

const download = (row: any) => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'get',
    url: '/api/thesis/getPDF',
    params: { thesis_id: row.thesisId },
    responseType: 'blob',
    headers: { 'Authorization': `Bearer ${token}`, }
  }).then(function (res) {
    const link = document.createElement('a');
    const blob = new Blob([res.data]);
    link.href = window.URL.createObjectURL(blob);
    link.download = `第${row.thesisId}号论文.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(res)
    ElMessage.success('下载成功')
  }, err => {
    ElMessage.error('下载失败')
    console.log(err)
  })
}

onMounted(() => {
  auth.value = window.localStorage.getItem('auth')
  init()
})
</script>

<style scoped></style>