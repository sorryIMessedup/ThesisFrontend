<template>
    <el-card>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h1>我审批的开题报告</h1>
      </div>
      <span>您应在<b>2023年12月27日</b>前完成审阅《本科生毕业论文（设计）开题报告》。</span><br>
      <el-divider />
      <el-table stripe :data="proposalData.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="" :border="false">
        <el-table-column fixed prop="proposalId" label="开题报告ID" width="100" />
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
        layout="sizes, prev, pager, next" :total="proposalData.length" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </el-card>
  </template>
  
  <script lang="ts" setup>
  import axios from 'axios';
  import { onMounted, ref } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  
  const proposalData = ref([])
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
      url: '/api/proposals/get_by_teacher',
      params: { teacher_id: window.localStorage.getItem('uid') },
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(function (res) {
      ElMessage.success('获取所有开题报告成功')
      for (let item of res.data) {
        if (item.teacherPass === 0) item.teacherPass = '未处理'
        if (item.teacherPass === 1) item.teacherPass = '已通过'
        if (item.teacherPass === 2) item.teacherPass = '已拒绝'
      }
      proposalData.value = res.data
      console.log(res)
    }, err => {
        ElMessage.success('获取所有开题报告成功')
      console.log(err)
    })
    let currentDate = new Date()
    let proposalEndDate = new Date('2023-11-17T00:00:01')
    if (currentDate > proposalEndDate) {
      ElMessageBox.alert('您已超过时限，无法审批开题报告了！', '警告', {
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
      url: '/api/proposal/pass',
      params: { proposal_id: row.proposalId },
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
      url: '/api/proposal/refuse',
      params: { proposal_id: row.proposalId },
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
      url: '/api/proposal/getPDF',
      params: { aproposal_id: row.proposalId },
      responseType: 'blob',
      headers: { 'Authorization': `Bearer ${token}`, }
    }).then(function (res) {
      const link = document.createElement('a');
      const blob = new Blob([res.data]);
      link.href = window.URL.createObjectURL(blob);
      link.download = `第${row.proposalId}号申请.pdf`;
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