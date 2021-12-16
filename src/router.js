import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import { Splash, Login, Register, Dashboard, Play, Browse } from '@/views'
import { randomPoemID as randomPoemIDQuery } from '@/queries'
import { ReminderService, Constants } from '@/services'
import { PoemLocation } from '@/utilities'
import { apolloClient } from '@/apollo'

const { LocationType } = Constants;

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
      apolloClient.mutate({ mutation: randomPoemIDQuery })
        .then(result => result.data.randomPoem.poem.id)
        .then(id => {
          // Transition to play page with the new poem ID
          const location = new PoemLocation({t: LocationType.DIRECT, pid: id}).encode();
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
    component: Play,
    props: true,
    // TODO Move to play component
    beforeEnter(to, from, next) {
      // If user is not logged in (playing as guest), we send them a polite reminder
      if (!store.getters.hasIdentity) {
        ReminderService.show('playingasguest');
      }
      next();
    },
  },
  {
    path: '/browse',
    name: 'Browse',
    component: Browse,
  },
]});

export default router
