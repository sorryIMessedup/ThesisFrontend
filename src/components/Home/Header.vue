<template>
  <div class="header-left">
    <div style="display: flex; align-items: center;">
      <img src="@/assets/logo.png" style="width: 60px; height: 60px; padding-right: 15px;"></img>
      <h1>论文系统</h1>
    </div>

  </div>
  <div class="header-right">
    <span style="padding-right: 50px; color: black;">欢迎您, {{ username }}</span>
    <el-button size="large" @click="dialogVisible1 = true">修改密码</el-button>&nbsp;
    <el-button size="large" @click="dialogVisible2 = true">修改用户名</el-button>
  </div>

  <el-dialog v-model="dialogVisible1" title="修改密码" width="500px" :before-close="handleClose">
    <el-form ref="ruleFormRef1" :rules="rules1" :model="form1" style="max-width: 400px; padding-left: 10px;"
      label-position="right">
      <el-form-item label="旧密码&nbsp;&nbsp;&nbsp;&nbsp;" prop="oldPassword">
        <el-input v-model="form1.oldPassword" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="新密码&nbsp;&nbsp;&nbsp;&nbsp;" prop="newPassword">
        <el-input v-model="form1.newPassword" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmedNewPassword">
        <el-input v-model="form1.confirmedNewPassword" type="password" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible1 = false, resetForm(ruleFormRef1)">取消</el-button>
        <el-button type="primary" @click="modifyPassword(ruleFormRef1)">确认修改</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="dialogVisible2" title="修改用户名" width="500px" :before-close="handleClose">
    <el-form ref="ruleFormRef2" :rules="rules2" :model="form2" style="max-width: 400px; padding-left: 10px;"
      label-position="right">
      <el-form-item label="新用户名&nbsp;&nbsp;&nbsp;&nbsp;" prop="newUsername">
        <el-input v-model="form2.newUsername" autocomplete="off" />
      </el-form-item>
      <el-form-item label="确认用户名" prop="confirmedNewUsername">
        <el-input v-model="form2.confirmedNewUsername" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible2 = false, resetForm(ruleFormRef2)">取消</el-button>
        <el-button type="primary" @click="modifyUsername(ruleFormRef2)">确认修改</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import axios from 'axios';

const username = ref('')
const dialogVisible1 = ref(false)
const dialogVisible2 = ref(false)
const ruleFormRef1 = ref<FormInstance>()
const ruleFormRef2 = ref<FormInstance>()

const uid = ref('')

const form1 = reactive({
  oldPassword: '',
  newPassword: '',
  confirmedNewPassword: ''
})
const form2 = reactive({
  newUsername: '',
  confirmedNewUsername: ''
})

const validateOldPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入旧密码'))
  } else {
    if (form1.confirmedNewPassword !== '') {
      if (!ruleFormRef1.value) return
      ruleFormRef1.value.validateField('newPassword')
    }
    callback()
  }
}
const validateNewPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else {
    if (form1.confirmedNewPassword !== '') {
      if (!ruleFormRef1.value) return
      ruleFormRef1.value.validateField('confirmedNewPassword')
    }
    callback()
  }
}
const validateConfirmedNewPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== form1.newPassword) {
    callback(new Error("两次输入的新密码不一致"))
  } else {
    callback()
  }
}
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
const validateNewUsername = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入新用户名'))
  } else {
    if (form2.confirmedNewUsername !== '') {
      if (!ruleFormRef2.value) return
      ruleFormRef1.value.validateField('confirmedNewUsername')
    }
    callback()
  }
}
const validateConfirmedNewUsername = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新用户名'))
  } else if (value !== form2.newUsername) {
    callback(new Error("两次输入的新用户名不一致"))
  } else {
    callback()
  }
}

const rules1 = reactive<FormRules<typeof form1>>({
  oldPassword: [{ validator: validateOldPassword, trigger: 'blur', required: true }],
  newPassword: [{ validator: validateNewPassword, trigger: 'blur', required: true }],
  confirmedNewPassword: [{ validator: validateConfirmedNewPassword, trigger: 'blur', required: true }]
})
const rules2 = reactive<FormRules<typeof form2>>({
  newUsername: [{ validator: validateNewUsername, trigger: 'blur', required: true }],
  confirmedNewUsername: [{ validator: validateConfirmedNewUsername, trigger: 'blur', required: true }]
})

const modifyPassword = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      let token = window.localStorage.getItem('token')
      axios({
        method: 'post',
        url: '/api/user/update_password',
        params: {
          uid: uid.value,
          old_password: form1.oldPassword,
          new_password: form1.newPassword
        },
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(function (res) {
        if (res.data.error_message != 'success')
          ElMessage.error('修改失败, ' + res.data.error_message)
        else ElMessage.success('修改成功')
        dialogVisible1.value = false
        resetForm(ruleFormRef1.value)
        console.log(res)
      }, err => {
        ElMessage.error('修改失败 ' + err)
        console.log(err)
        dialogVisible1.value = false
        resetForm(ruleFormRef1.value)
      })
    } else {
      ElMessage.warning('请先完成表单！')
    }
  })

}

const modifyUsername = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      let token = window.localStorage.getItem('token')
      axios({
        method: 'post',
        url: '/api/user/update_username',
        params: {
          uid: uid.value,
          username: form2.newUsername
        },
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(function (res) {
        if (res.data.error_message != 'success')
          ElMessage.error('修改失败, ' + res.data.error_message)
        else {
          ElMessage.success('修改成功')
          username.value = form2.newUsername
          window.localStorage.setItem('username', form2.newUsername)
        }
        console.log(res)
        dialogVisible2.value = false
        resetForm(ruleFormRef2.value)
      }, err => {
        ElMessage.error('修改失败, ' + err)
        console.log(err)
        dialogVisible2.value = false
        resetForm(ruleFormRef2.value)
      })
    } else {
      ElMessage.warning('请先完成表单！')
    }
  })
}

onMounted(() => {
  username.value = window.localStorage.getItem('username')
  uid.value = window.localStorage.getItem('uid')
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
</script>

<style scoped>
.header-left {
  flex: 1;
  text-align: left;
  padding-left: 10px;
}

.header-right {
  flex: 1;
  text-align: right;
  padding-right: 10px;
}
</style>