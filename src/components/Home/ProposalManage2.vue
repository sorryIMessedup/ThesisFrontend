<template>
    <el-card>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h1>申请我的</h1>
      </div>
      <span>您应在<b>2023年11月17日</b>前确定学生的导师，审阅《本科生毕业论文指导老师意见表》。</span><br>
      <span>逾期将无法操作，即无法通过或拒绝任何同学的申请。</span>
      <el-divider />
      <el-table stripe :data="applicationData.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="" :border="false">
        <el-table-column fixed prop="applicationId" label="申请ID" width="100" />
        <el-table-column prop="studentId" label="学生ID" width="150" />
        <el-table-column prop="teacherPass" label="状态" width="100" />
        <el-table-column prop="" label="操作" min-width="270">
          <template #default="scope">
            <el-button type="primary" @click="agree(scope.row)" :disabled="scope.row.teacherPass == '已通过' || canApply">通过</el-button>
            <el-button type="danger" @click="refuse(scope.row)" :disabled="scope.row.teacherPass == '已拒绝' || canApply">拒绝</el-button>
            <el-button type="default" @click="download(scope.row)">下载申请表</el-button>
          </template>
        </el-table-column>
      </el-table>
      <br>
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
        layout="sizes, prev, pager, next" :total="applicationData.length" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </el-card>
  </template>
  
  <script lang="ts" setup>
  import axios from 'axios';
  import { onMounted, ref } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  
  const applicationData = ref([])
  const pageNum = ref(1)
  const pageSize = ref(5)
  const canApply = ref(false)
  
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
      url: '/api/application/get_by_teacher',
      params: { teacher_id: window.localStorage.getItem('uid') },
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(function (res) {
      ElMessage.success('获取所有申请成功')
      for (let item of res.data.application_list) {
        if (item.teacherPass === 0) item.teacherPass = '未处理'
        if (item.teacherPass === 1) item.teacherPass = '已通过'
        if (item.teacherPass === 2) item.teacherPass = '已拒绝'
      }
      applicationData.value = res.data.application_list
      console.log(res)
    }, err => {
      ElMessage.error('获取所有申请失败')
      console.log(err)
    })
    let currentDate = new Date()
    let applicationEndDate = new Date('2023-11-17T00:00:01')
    if (currentDate > applicationEndDate) {
      ElMessageBox.alert('您已超过时限，无法成为更多学生的导师了！', '警告', {
        confirmButtonText: 'OK',
      })
      canApply.value = true
      return
    }
  }
  
  const agree = (row: any) => {
    let token = window.localStorage.getItem('token')
    axios({
      method: 'post',
      url: '/api/application/pass',
      params: { application_id: row.applicationId },
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
  
  const refuse = (row: any) => {
    let token = window.localStorage.getItem('token')
    axios({
      method: 'post',
      url: '/api/application/refuse',
      params: { application_id: row.applicationId },
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
  
  const download = (row: any) => {
    let token = window.localStorage.getItem('token')
    axios({
      method: 'get',
      url: '/api/application/getPDF',
      params: { application_id: row.applicationId },
      responseType: 'blob',
      headers: { 'Authorization': `Bearer ${token}`, }
    }).then(function (res) {
      const link = document.createElement('a');
      const blob = new Blob([res.data]);
      link.href = window.URL.createObjectURL(blob);
      link.download = `第${row.applicationId}号申请.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(res)
      ElMessage.success('下载成功')
    }, err => {
      ElMessage.error('该申请无附件')
      console.log(err)
    })
  }
  
  onMounted(() => {
    init()
  })
  </script>
  
  <style scoped></style>