import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import { Splash, Login, Register, Dashboard, Gameboard, Find } from '@/views'
import { RandomPoem } from '@/queries'
import { Constants } from '@/services'
import { PoemLocation } from '@/utilities'
import { apolloClient } from '@/apollo'

const { LocationType } = Constants;
const { isNavigationFailure, NavigationFailureType } = VueRouter

Vue.use(VueRouter)

const router = new VueRouter({
routes: [
  {
    path: '/',
    name: 'Root',
    redirect() {
      // If user is logged in, we redirect them to the dashboard. Otherwise the splash view.
      if (store.getters.hasIdentity) {
        return { name: 'Dashboard' };
      }
      return { name: 'Splash' };
    },
  },
  {
    path: '/randompoem',
    name: 'RandomPoem',
    beforeEnter(to, from, next) {
      // Execute server query
      apolloClient.mutate({ mutation: RandomPoem })
        .then(result => result.data.randomPoem.poem.id)
        .then(id => {
          // Transition to play page with the new poem ID
          const location = new PoemLocation({t: LocationType.Direct, p: id}).encode();
          next({ name: 'Play', params: {location}});
        });
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
    path: '/play/:location',
    name: 'Play',
    component: Gameboard,
    props: route => ({ mode: 'play', ...route.params }),
  },
  {
    path: '/edit/:poemID?',
    name: 'Edit',
    component: Gameboard,
    props: route => ({ mode: 'edit', ...route.params }),
  },
  {
    path: '/tutorial',
    name: 'Tutorial',
    component: Gameboard,
    props: { mode: 'tutorial' },
  },
  {
    path: '/find',
    name: 'Find',
    component: Find,
  },
]});

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
