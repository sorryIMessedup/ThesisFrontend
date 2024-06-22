<template>
  <el-card>
    <h1>论文系统登录</h1>
    <div class="form">
      <el-form ref="ruleFormRef" :rules="rules" :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="doLogin(ruleFormRef)">登录</el-button>
      <el-button @click="$router.push('/login/register')">注册</el-button>
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

const form = reactive({
  username: '',
  password: ''
})

const rules = reactive<FormRules<typeof form>>({
  username: [{ trigger: 'blur', required: true, message: '请输入用户名' }],
  password: [{ trigger: 'blur', required: true, message: '请输入密码' }]
})

const doLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      axios({
        method: 'post',
        url: '/api/user/login',
        params: {
          username: form.username,
          password: form.password
        }
      }).then(function (res) {
        console.log(res)
        ElMessage.success('登录成功')
        window.localStorage.setItem('token', res.data.token)
        window.localStorage.setItem('auth', res.data.authority)
        window.localStorage.setItem('uid', res.data.uid)
        window.localStorage.setItem('username', res.data.username)
        router.push('/home')
      }, err => {
        console.log(err);
        ElMessage.error('登录失败')
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
}

.form {
  padding-top: 40px;
  color: black;
}
</style>