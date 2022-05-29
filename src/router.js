import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import { Splash, Login, Register, Dashboard, Gameboard, Browse, Page } from '@/views'
import { RandomPoem } from '@/queries'
import { Constants } from '@/services'
import { PoemLocation } from '@/utilities'
import { apolloClient } from '@/apollo'

const { LocationType } = Constants;
const { isNavigationFailure, NavigationFailureType } = VueRouter

let init = store.dispatch('init');

Vue.use(VueRouter)

const router = new VueRouter({
routes: [
  {
    path: '/',
    name: 'Root',
    beforeEnter(to, from, next) {
      next(store.getters.hasIdentity ? { name: 'Dashboard' } : { name: 'Splash' });
    },
  },
  {
    path: '/randompoem',
    name: 'RandomPoem',
    async beforeEnter(to, from, next) {
      // Execute server query
      let { poem } = (await apolloClient.mutate({ mutation: RandomPoem })).data.randomPoem;
      // Transition to play page with the new poem ID
      const location = new PoemLocation({t: LocationType.DIRECT, p: poem.id}).encode();
      next({ name: 'Gameboard', query: {location}});
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
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { transitory: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/gameboard',
    name: 'Gameboard',
    component: Gameboard,
    props: route => (route.query)
  },
  {
    path: '/browse',
    name: 'Browse',
    component: Browse,
    props: route => (route.query)
  },
  {
    path: '/page/:path',
    name: 'Page',
    component: Page,
    props: route => ({...route.params, ...route.query})
  },
]});

router.beforeEach((to, from, next) => {
  init.then(next);
});

// Modify the router push method to not throw errors when it is working as intended :(
// This should be fixed in the next version of vue-router
// Code gratiously adapted from https://stackoverflow.com/a/64808960
// See also https://github.com/vuejs/vue-router/issues/2932
const originalPush = router.push;
router.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject);
  }
  return originalPush.call(this, location).catch((err) => {
    if (!isNavigationFailure(err, NavigationFailureType.redirected)) {
      Promise.reject(err)
    }
  });
};

export default router
