<template>
  <el-card>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <h1>我的开题报告</h1>
      <el-button type="primary" @click="dialogVisible = true" :disabled="!canApply">新建开题报告</el-button>
    </div>
    <span>学生应在<b>2023年12月8日</b>前确定完成《本科生毕业论文（设计）开题报告》。<br></span>
    <span>在<b>12月27日</b>前应提交开题报告。</span>
    <el-divider />

    <el-steps align-center style="max-width: 600px; margin-left: 20px;" :active="active" process-status="wait"
      finish-status="success" :space="300">
      <el-step title="1. 提交开题报告" description="请务必提交开题报告" status="" />
      <el-step title="2. 等待审批" description="等待导师审批开题报告" status="" />
      <el-step title="3. 完成开题报告" description="需在规定日期前完成" status="success" v-if="active == 3" />
      <el-step title="3. 完成开题报告" description="需在规定日期日前完成" status="error" v-if="active == 4" />
    </el-steps>

    <el-divider />
    <el-table stripe :data="proposalData.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style=""
      :border="false">
      <el-table-column fixed prop="proposalId" label="开题报告ID" width="150" />
      <el-table-column prop="teacherId" label="导师ID" width="150" />
      <el-table-column prop="teacherPass" label="状态" width="150" />
      <el-table-column prop="teacherPass" label="操作">
        <template #default="scope">
          <el-button type="primary" @click="download(scope.row)" size="default">下载开题报告</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
      layout="sizes, prev, pager, next" :total="proposalData.length" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </el-card>
  <el-divider />

  <el-dialog v-model="dialogVisible" title="新建开题报告" width="500" :before-close="handleClose">
    <h1>上传《本科生毕业论文（设计）开题报告》</h1>
    <el-upload v-model:file-list="fileList" :auto-upload="false" class="upload-demo" action=""
      :on-preview="handlePreview" :on-remove="handleRemove" :before-remove="beforeRemove" :limit="1"
      :on-exceed="handleExceed" :multiple="false">
      <el-button type="primary">点击上传</el-button>
      <template #tip>
        <div class="el-upload__tip">仅限1MB下的PDF文件, 文件名仅包含ASCII字符</div>
      </template>
    </el-upload>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doApply">确认提交</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Action, UploadProps, UploadUserFile } from 'element-plus'

const fileList = ref<UploadUserFile[]>([])
const active = ref(0)
const pageNum = ref(1)
const pageSize = ref(5)

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
}

const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
  console.log(file, uploadFiles)
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile)
}

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning('最多只能上传1个文件')
}

const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    `确认删除 ${uploadFile.name} 吗？`
  ).then(
    () => true,
    () => false
  )
}

const dialogVisible = ref(false)
const proposalData = ref([])
const teacherData = ref([])
const value = ref('')
const canApply = ref(true)

const doApply = () => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'post',
    url: '/api/proposals/add',
    params: {
      student_id: window.localStorage.getItem('uid')
    },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    // add成功
    if (res.data.error_message == 'success') {
      // 有文件
      if (fileList.value.at(0)) {
        let fd = new FormData()
        fd.append('file', fileList.value.at(0).raw)
        fd.append('proposal_id', res.data.proposal_id)
        axios({
          method: 'post',
          url: '/api/proposals/uploadPdf',
          data: fd,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }).then(function (ress) {
          ElMessage.success('申请成功')
          console.log(ress)
        }, err => {
          ElMessage.error('申请失败 ' + err)
          console.log(err)
        })
      }
      // 无文件
      else ElMessage.success('申请成功')
      console.log(res)
    }
    // add失败
    else {
      ElMessage.error('申请失败, ' + res.data.error_message)
      console.log(res)
    }
  }, err => {
    ElMessage.error('申请失败 ' + err)
    console.log(err)
  })
  dialogVisible.value = false
}

const init = () => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'get',
    url: '/api/proposals/student/' + window.localStorage.getItem('uid'),
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    console.log(res)
    ElMessage.success('获取我的开题报告成功')
    for (let item of res.data) {
      if (item.teacherPass === 0) {
        item.teacherPass = '未处理'
        canApply.value = false
        active.value = 1
      }
      if (item.teacherPass === 1) {
        item.teacherPass = '已通过'
        canApply.value = false
        active.value = 3
      }
      if (item.teacherPass === 2) {
        item.teacherPass = '已拒绝'
        active.value = 4
      }
    }
    proposalData.value = res.data
    console.log(res)
  }, err => {
    ElMessage.error('获取我的开题报告失败')
    console.log(err)
  })
  axios({
    method: 'get',
    url: '/api/teacher/get_all',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    teacherData.value = res.data.teacher_list
    console.log(res)
  }, err => {
    ElMessage.error('获取所有导师失败')
    console.log(err)
  })
  let currentDate = new Date()
  let proposalEndDate = new Date('2023-12-27T00:00:01')
    if (currentDate > proposalEndDate) {
    ElMessageBox.alert('您已超过时限，无法提交开题报告了！', '警告', {
      confirmButtonText: 'OK',
    })
    canApply.value = false
    return
  }
}

onMounted(() => {
  init()
})

const download = (row: any) => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'get',
    url: '/api/proposals/getPDF',
    params: { proposal_id: row.proposalId },
    responseType: 'blob',
    headers: { 'Authorization': `Bearer ${token}`, }
  }).then(function (res) {
    const link = document.createElement('a');
    const blob = new Blob([res.data]);
    link.href = window.URL.createObjectURL(blob);
    link.download = `第${row.proposalId}号开题报告.pdf`;
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

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确认关闭吗?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}
</script>

<style scoped></style>