<template>
  <el-card>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <h1>我的申请</h1>
      <el-button type="primary" @click="dialogVisible = true" :disabled="!canApply">新建申请</el-button>
    </div>
    <span>学生应在<b>2023年11月17日</b>前确定导师，提交《本科生毕业论文指导老师意见表》。<br></span>
    <span>逾期将无法选择导师，即无法完成毕业论文流程。</span>
    <el-divider />

    <el-steps align-center style="max-width: 600px; margin-left: 20px;" :active="active" process-status="wait"
      finish-status="success" :space="300">
      <el-step title="1. 提交申请" description="请务必提交申请" status="" />
      <el-step title="2. 等待申请" description="等待导师审批" status="" />
      <el-step title="3. 完成申请" description="需在规定日期前完成" status="success" v-if="active == 3" />
      <el-step title="3. 完成申请" description="需在规定日期日前完成" status="error" v-if="active == 4" />
    </el-steps>

    <el-divider />
    <el-table stripe :data="applicationData.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="" :border="false">
      <el-table-column fixed prop="applicationId" label="申请ID" width="150" />
      <el-table-column prop="teacherId" label="导师ID" width="150" />
      <el-table-column prop="teacherPass" label="状态" width="150" />
      <el-table-column prop="teacherPass" label="操作">
        <template #default="scope">
          <el-button type="primary" @click="download(scope.row)" size="default">下载申请表</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
      layout="sizes, prev, pager, next" :total="applicationData.length" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </el-card>
  <el-divider />

  <el-dialog v-model="dialogVisible" title="新建申请" width="500" :before-close="handleClose">
    <h1>选择导师</h1>
    请选择导师：
    <el-select v-model="value" placeholder="导师" size="large" style="width: 240px">
      <el-option v-for="item in teacherData" :key="item.uid" :label="item.username" :value="item.uid" />
    </el-select> &nbsp;
    <el-divider />
    <h1>(可选)上传《本科生毕业论文指导老师意向表》</h1>
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
        <el-button type="primary" @click="doApply">确认申请</el-button>
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
const applicationData = ref([])
const teacherData = ref([])
const value = ref('')
const canApply = ref(true)

const doApply = () => {
  if (value.value == '') {
    ElMessage.warning('请先选择导师！')
    return
  }
  let token = window.localStorage.getItem('token')
  axios({
    method: 'post',
    url: '/api/application/add',
    params: {
      student_id: window.localStorage.getItem('uid'),
      teacher_id: value.value
    },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    // add成功
    if (res.data.error_message == 'success') {
      // 有文件
      if (fileList.value.at(0)) {
        let fd = new FormData()
        fd.append('file', fileList.value.at(0).raw)
        fd.append('application_id', res.data.application_id)
        axios({
          method: 'post',
          url: '/api/application/uploadPdf',
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
    url: '/api/application/get_by_student',
    params: { student_id: window.localStorage.getItem('uid') },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    ElMessage.success('获取我的申请成功')
    for (let item of res.data.application_list) {
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
    applicationData.value = res.data.application_list
    console.log(res)
  }, err => {
    ElMessage.error('获取我的申请失败')
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
  let applicationEndDate = new Date('2023-11-17T00:00:01')
  if (currentDate > applicationEndDate) {
    ElMessageBox.alert('您已超过时限，无法申请导师了！', '警告', {
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