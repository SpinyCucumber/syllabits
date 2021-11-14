<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view v-if="$route.meta.transitory"/>
      <div v-else class="main">
        <b-navbar>

          <!-- Items rendered at beginning of navbar -->
          <template #start>
            <transition-group name="list" tag="div" class="is-flex">
              <b-navbar-item
                v-for="link in additionalLinks"
                tag="router-link"
                :key="link.key"
                :to="link.to">
                {{ $translation.get('navbar.' + link.key) }}
              </b-navbar-item>
            </transition-group>
          </template>

          <template #brand>
            <b-navbar-item tag="router-link" :to="{ name: $store.getters.hasIdentity ? 'Dashboard' : 'Splash' }">
              <img :src="$assets.getTexture('Logo')"/>
            </b-navbar-item>
          </template>

        </b-navbar>
        <transition name="fade" mode="out-in">
          <router-view class="inner" :additionalLinks.sync="additionalLinks"/>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      additionalLinks: [],
    }
  },
}
</script>
