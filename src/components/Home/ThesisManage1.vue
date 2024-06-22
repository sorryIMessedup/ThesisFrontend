<template>
  <el-card>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <h1>提交论文</h1>
      <el-button type="primary" @click="dialogVisible = true" :disabled="!canApply">新建论文</el-button>
    </div>
    <span>学生应在<b>2024年3月10日</b>前提交毕业论文，<b>3月17日</b>前导师需填写指导意见。<br></span>
    <span>导师在<b>4月17日</b>前需完成评审，教务在<b>4月25日</b>前完成最终评审。<br></span>
    <el-divider />
    <el-steps align-center style="max-width: 800px; margin-left: 20px;" :active="active" process-status="wait"
      finish-status="success" :space="200">
      <el-step title="1. 选择导师" description="2023/11/17前" status="" />
      <el-step title="2. 提交论文" description="2024/3/10前" status="" />
      <el-step title="3. 等待审批" description="" status="" />
      <el-step title="4. 导师审批" description="2024/4/17前" status="" v-if="active == 4 || active == 7 || active == 3 || active == 5" />
      <el-step title="4. 导师审批" description="2024/4/17前" status="error" v-if="active == 6" />
      <el-step title="5. 教务审批" description="2024/4/25前" status="wait" v-if="active == 6 || active == 4 || active == 3" />
      <el-step title="5. 教务审批" description="2024/4/25前" status="success" v-if="active == 5" />
      <el-step title="5. 教务审批" description="2024/4/25前" status="error" v-if="active == 7" />
    </el-steps>
    <el-divider />
    <el-table stripe :data="thesisData.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="" :border="false">
      <el-table-column fixed prop="thesisId" label="论文ID" width="70" />
      <el-table-column prop="teacherId" label="导师ID" width="100" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="result" label="查重率" width="70" />
      <el-table-column prop="teacherPass" label="导师审批" width="80" />
      <el-table-column prop="deanPass" label="教务审批" width="100" />
      <el-table-column prop="" label="操作" width="160">
        <template #default="scope">
          <el-button type="default" @click="doModify(scope.row)" size="default" :disabled="!canApply">编辑</el-button>
          <el-button type="primary" @click="download(scope.row)" size="default" :disabled="!canApply">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
      layout="sizes, prev, pager, next" :total="thesisData.length" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </el-card>
  <el-divider />

  <el-dialog v-model="dialogVisible" title="论文" width="500" :before-close="handleClose">
    <h1>查重百分比(可选)</h1>
    <div style="display: flex; align-items: center; justify-content:left">
      <div>请输入查重百分比：</div>
      <el-input v-model="value" style="width: 250px;"></el-input>
    </div>
    <el-divider />
    <h1>上传论文</h1>
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
        <el-button type="primary" @click="doApply" v-if="!modifyMode">确认申请</el-button>
        <el-button type="primary" @click="dodoModify" v-if="modifyMode">确认申请</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadProps, UploadUserFile } from 'element-plus'

const fileList = ref<UploadUserFile[]>([])
const pageNum = ref(1)
const pageSize = ref(5)
const canApply = ref(true)
const active = ref(0)

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
const thesisData = ref([])
const value = ref(0)
const modifyMode = ref(false)
const rrow = ref({})

const doApply = () => {
  let token = window.localStorage.getItem('token')
  axios({
    method: 'post',
    url: '/api/thesis/add',
    params: {
      student_id: window.localStorage.getItem('uid'),
      result: value.value,
      version: 0
    },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    if (res.data.error_message == 'success') { // add成功
      if (fileList.value.at(0)) { // 有文件
        let fd = new FormData()
        fd.append('file', fileList.value.at(0).raw)
        fd.append('thesis_id', res.data.thesis_id)
        axios({
          method: 'post',
          url: '/api/thesis/uploadPdf',
          data: fd,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }).then(function (ress) {
          ElMessage.success('上传成功')
          init()
          console.log(ress)
        }, err => {
          ElMessage.error('上传失败 ' + err)
          console.log(err)
        })
      }
      else ElMessage.success('上传成功') // 无文件
      init()
      console.log(res)
    }
    else { // add失败
      ElMessage.error('上传失败, ' + res.data.error_message)
      console.log(res)
    }
  }, err => {
    ElMessage.error('上传失败 ' + err)
    console.log(err)
  })
  dialogVisible.value = false
}

const doModify = (row: any) => {
  dialogVisible.value = true
  modifyMode.value = true
  rrow.value = row
}

const dodoModify = () => {
  let token = window.localStorage.getItem('token')
  let row = rrow.value
  axios({
    method: 'post',
    url: '/api/thesis/update',
    params: {
      thesis_id: row.thesisId,
      result: value.value,
      version: 0
    },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    if (res.data.error_message == 'success') { // add成功
      if (fileList.value.at(0)) { // 有文件
        let fd = new FormData()
        fd.append('file', fileList.value.at(0).raw)
        fd.append('thesis_id', res.data.thesis_id)
        axios({
          method: 'post',
          url: '/api/thesis/uploadPdf',
          data: fd,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }).then(function (ress) {
          ElMessage.success('上传成功')
          init()
          console.log(ress)
        }, err => {
          ElMessage.error('上传失败 ' + err)
          console.log(err)
        })
      }
      else ElMessage.success('上传成功') // 无文件
      init()
      console.log(res)
    }
    else { // add失败
      ElMessage.error('上传失败, ' + res.data.error_message)
      console.log(res)
    }
  }, err => {
    ElMessage.error('上传失败 ' + err)
    console.log(err)
  })
  dialogVisible.value = false
  modifyMode.value = false
}

const init = () => {
  let token = window.localStorage.getItem('token')
  axios({ // 确认是否有导师
    method: 'get',
    url: '/api/application/get_by_student',
    params: { student_id: window.localStorage.getItem('uid') },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    for (let item of res.data.application_list)
      if (item.teacherPass == 1)
        active.value = 1
    console.log(res)
  }, err => {
    ElMessage.error(err)
  })
  axios({ // 确认是否已提交论文
    method: 'get',
    url: '/api/thesis/get_by_student',
    params: { student_id: window.localStorage.getItem('uid') },
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(function (res) {
    ElMessage.success('获取论文成功')
    if (res.data.thesis_list.length > 0) active.value = 3
    for (let item of res.data.thesis_list) {
      if (item.teacherPass === 0) {
        item.teacherPass = '未处理'
        active.value = active.value > 3 ? active.value : 3
      }
      if (item.teacherPass === 1) {
        item.teacherPass = '已通过'
        active.value = active.value > 4 ? active.value : 4
      }
      if (item.teacherPass === 2) {
        item.teacherPass = '已拒绝'
        active.value = active.value < 6 ? active.value : 3
      }
      if (item.deanPass === 0) {
        item.deanPass = '未处理'
      }
      if (item.deanPass === 1) {
        item.deanPass = '已通过'
        active.value = 5
      }
      if (item.deanPass === 2) {
        item.deanPass = '已拒绝'
        active.value = 7
      }
    }
    thesisData.value = res.data.thesis_list
    console.log(res)
  }, err => {
    ElMessage.error('获取论文失败')
    console.log(err)
  })
  let currentDate = new Date()
  let applicationEndDate = new Date('2024-03-10T00:00:01')
  if (currentDate > applicationEndDate) {
    ElMessageBox.alert('您已超过时限，无法提交论文了！', '警告', {
      confirmButtonText: 'OK',
    })
    canApply.value = false
    return
  }
}

onMounted(() => {
  init()
})

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确认关闭吗?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
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

</script>

<style scoped></style>