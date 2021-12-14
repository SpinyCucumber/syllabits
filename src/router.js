import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import { Splash, Login, Register, Dashboard, Play, Browse } from '@/views'
import { randomPoemID as randomPoemIDQuery } from '@/queries'
import { ReminderService } from '@/services'
import { apolloClient } from '@/apollo'

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
          next({ name: 'Play', params: {location: `{"type": "direct", "poemID": "${id}"}`}});
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
    path: '/play/:poemID',
    name: 'Play',
    component: Play,
    props: true,
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
