<template>
  <el-card>
    <h1>论文系统注册</h1>
    <div class="form">
      <el-form ref="ruleFormRef" :rules="rules" :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmedPassword">
          <el-input v-model="form.confirmedPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="doRegister(ruleFormRef)">注册</el-button>
      <el-button @click="$router.push('/login')">返回</el-button>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import axios from 'axios'
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { useRouter } from 'vue-router'

const router = useRouter()
const ruleFormRef = ref<FormInstance>()

const validatePassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else {
    if (form.confirmedPassword !== '') {
      if (!ruleFormRef.value) return
      ruleFormRef.value.validateField('confirmedPassword')
    }
    callback()
  }
}
const validateConfirmedPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== form.password) {
    callback(new Error("两次输入的新密码不一致"))
  } else {
    callback()
  }
}

const form = reactive({
  username: '',
  password: '',
  confirmedPassword: ''
})

const rules = reactive<FormRules<typeof form>>({
  username: [{ trigger: 'blur', required: true, message: '请输入用户名' }],
  password: [{ validator: validatePassword, trigger: 'blur', required: true }],
  confirmedPassword: [{ validator: validateConfirmedPassword, trigger: 'blur', required: true }]
})

const doRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      axios({
        method: 'post',
        url: '/api/user/register',
        params: {
          username: form.username,
          password: form.password
        }
      }).then(function (res) {
        console.log(res)
        ElMessage({
          message: '注册成功',
          type: 'success'
        })
        router.push('/login')
      }, err => {
        console.log(err);
        ElMessage.error('注册失败')
      })
    } else {
      ElMessage.warning('请完成表单！')
    }
  })

}

</script>

<style scoped>
.el-card {
  height: 500px;

  .form {
    padding-top: 40px;
    color: black;
  }
}
</style>