import Vue from 'vue'
import VueRouter from 'vue-router'
import { Splash, Login, Dashboard, Play } from '@/views'
import IdentityManager from '@/services/IdentityManager'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Root',
    redirect() {
      // If user is logged in, we redirect them to the dashboard. Otherwise the splash view.
      if (IdentityManager.hasIdentity()) {
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
  },
  {
    path: '/play/:id',
    name: 'Play',
    component: Play,
    props: true,
  }
]

const router = new VueRouter({
  routes
})

export default router
