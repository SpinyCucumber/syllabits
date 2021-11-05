<template>
  <div id="app">
    <transition name="slide-prev">
      <router-view v-if="$route.meta.transitory"/>
      <div v-else class="main">
        <b-navbar>

          <!-- Items rendered at beginning of navbar -->
          <template #start>
            <b-navbar-item
              v-for="link in additionalLinks"
              tag="router-link"
              :key="link.key"
              :to="link.to">
              {{ $translation.get('navbar.' + link.key) }}
            </b-navbar-item>
          </template>

          <template #brand>
            <b-navbar-item tag="router-link" :to="{ name: identityState.identity ? 'Dashboard' : 'Splash' }">
              <img :src="$assets.getTexture('Logo')"/>
            </b-navbar-item>
          </template>

        </b-navbar>
        <transition name="slide-prev">
          <router-view class="inner" :additionalLinks.sync="additionalLinks"/>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>
import { IdentityService } from '@/services'

export default {
  name: 'App',
  data() {
    return {
      additionalLinks: [],
      identityState: IdentityService.state,
    }
  },
}
</script>
