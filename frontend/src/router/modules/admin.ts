import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/LoginRevamped.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/LayoutView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '儀表板' }
      },
      {
        path: 'projects',
        name: 'AdminProjects',
        component: () => import('@/views/admin/ProjectsView.vue'),
        meta: { title: '專案管理' }
      },
      {
        path: 'projects/create',
        name: 'AdminProjectCreate',
        component: () => import('@/views/admin/ProjectFormView.vue'),
        meta: { title: '新增專案' }
      },
      {
        path: 'projects/:id/edit',
        name: 'AdminProjectEdit',
        component: () => import('@/views/admin/ProjectFormView.vue'),
        meta: { title: '編輯專案' }
      },
      {
        path: 'profile',
        name: 'AdminProfile',
        component: () => import('@/views/admin/ProfileView.vue'),
        meta: { title: '個人資料' }
      },
      {
        path: 'experiences',
        name: 'AdminExperiences',
        component: () => import('@/views/admin/ExperiencesView.vue'),
        meta: { title: '經歷管理' }
      },
      {
        path: 'education',
        name: 'AdminEducation',
        component: () => import('@/views/admin/EducationView.vue'),
        meta: { title: '學歷管理' }
      },
      {
        path: 'hero',
        name: 'AdminHero',
        component: () => import('@/views/admin/HeroView.vue'),
        meta: { title: 'HERO 首頁設定' }
      },
      {
        path: 'contact',
        name: 'AdminContact',
        component: () => import('@/views/admin/ContactSettingsView.vue'),
        meta: { title: '聯絡設定' }
      },
      {
        path: 'messages',
        name: 'AdminMessages',
        component: () => import('@/views/admin/MessagesView.vue'),
        meta: { title: '訊息管理' }
      }
    ]
  }
]

export default adminRoutes
