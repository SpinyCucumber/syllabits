import Vue from 'vue'
import VueRouter from 'vue-router'
import { Splash, Login, Dashboard, Play } from '@/views'

import randomPoemIdQuery from '@/queries/randomPoemID.gql'

Vue.use(VueRouter)

const router = new VueRouter({
routes: [
  {
    path: '/',
    name: 'Root',
    redirect() {
      // If user is logged in, we redirect them to the dashboard. Otherwise the splash view.
      if (router.app.$identity.hasIdentity()) {
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
      // Make sure to wait until component is instantiated so we can access
      // apollo provider
      router.app.$nextTick(() => {
        router.app.$apollo.mutate({ mutation: randomPoemIdQuery })
          .then(result => result.data.randomPoem.poem.id)
          .then(id => {
            // Transition to play page with the new poem ID
            next({ name: 'Play', params: { poemID: id }});
          });
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
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/play/:poemID',
    name: 'Play',
    component: Play,
    props: true,
  }
]});

export default router
