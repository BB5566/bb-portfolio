import { createRouter, createWebHistory } from 'vue-router'
import adminRoutes from './modules/admin'
import { useAuthStore } from '@/stores/admin/auth'
import { getAppInstance } from '@/app-instance'
import { loadAdminUI } from '@/plugins/element-plus-admin'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置 NProgress
NProgress.configure({
  showSpinner: false, // 不顯示旋轉圖標
  trickleSpeed: 200,
  minimum: 0.3
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeNew.vue')
    },
    {
      path: '/projects/:id',
      name: 'ProjectDetail',
      component: () => import('@/views/ProjectDetail.vue'),
      meta: {
        transition: 'scale'
      }
    },
    ...adminRoutes,
    // 404 Not Found - 必須放在最後
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    }
  ],
  scrollBehavior(to, _from, _savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// 路由守衛 - 保護後台路由
router.beforeEach(async (to, from, next) => {
  // 開始進度條
  NProgress.start()

  // 進入後台才動態載入 Element Plus（CSS + 圖標），前台首頁零負擔
  if (to.path.startsWith('/admin')) {
    const app = getAppInstance()
    if (app) await loadAdminUI(app)
  }

  const authStore = useAuthStore()

  // 如果路由需要認證
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 未登入，跳轉到登入頁
      next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
    } else {
      // 已登入，延長 session
      authStore.extendSession()
      next()
    }
  } else if (to.name === 'AdminLogin' && authStore.isAuthenticated) {
    // 已登入卻訪問登入頁，跳轉到後台首頁
    next({ name: 'AdminDashboard' })
  } else {
    next()
  }
})

// 路由完成後關閉進度條
router.afterEach(() => {
  NProgress.done()
})

export default router
