import Vue from 'vue'
import VueRouter from 'vue-router'

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
  },
  {
    path: 'dashboard',
    name: 'Dashboard',
  }
]

const router = new VueRouter({
  routes
})

export default router
