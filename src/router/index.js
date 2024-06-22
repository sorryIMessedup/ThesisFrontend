import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

import LoginCard from '../components/Login/Login.vue'
import RegisterCard from '../components/Login/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/home',
      component: HomeView,
      children: [
        { path: 'userManage', component: () => import('../components/Home/UserManage.vue') },
        { path: 'thesisManage1', component: () => import('../components/Home/ThesisManage1.vue') },
        { path: 'thesisManage2', component: () => import('../components/Home/ThesisManage2.vue') },
        { path: 'applicationManage1', component: () => import('../components/Home/ApplicationManage1.vue') },
        { path: 'applicationManage2', component: () => import('../components/Home/ApplicationManage2.vue') },
        { path: 'teacherManage1', component: () => import('../components/Home/TeacherManage1.vue') },
        { path: 'teacherManage2', component: () => import('../components/Home/TeacherManage2.vue') },
        { path: 'studentManage', component: () => import('../components/Home/StudentManage.vue') }
      ]
    },
    {
      path: '/login',
      component: LoginView,
      children: [
        { path: '', component: LoginCard },
        { path: 'register', component: RegisterCard }
      ]
    }
  ]
})

export default router
