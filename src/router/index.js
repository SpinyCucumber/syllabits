import Vue from 'vue'
import VueRouter from 'vue-router'
import { Splash, Login, Dashboard } from '@/views'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Root',
    redirect() {
      // If user is logged in, we redirect them to the dashboard. Otherwise the splash view.
      if (this.$identityManager.hasIdentity()) {
        return { name: 'Dashboard' };
      }
      return { name: 'Splash' };
    },
  },
  {
    path: '/splash',
    name: 'Splash',
    component: Splash,
    meta: { transitory: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { transitory: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  }
]

const router = new VueRouter({
  routes
})

export default router
