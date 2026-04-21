import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/publish',
      name: 'Publish',
      component: () => import('@/views/Publish.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/poi-list',
      name: 'PoiList',
      component: () => import('@/views/PoiList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/blog-detail/:id',
      name: 'BlogDetail',
      component: () => import('@/views/BlogDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/poi-detail/:id',
      name: 'PoiDetail',
      component: () => import('@/views/PoiDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user-profile/:id?',
      name: 'UserProfile',
      component: () => import('@/views/UserProfile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/follow-blogs',
      name: 'FollowBlogs',
      component: () => import('@/views/FollowBlogs.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      component: Layout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/Home.vue')
        },
        {
          path: 'map',
          name: 'Map',
          component: () => import('@/views/Map.vue')
        },
        {
          path: 'message',
          name: 'Message',
          component: () => import('@/views/Message.vue')
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/Profile.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
