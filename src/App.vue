<template>
  <div class="app" :style="rootStyle">
    <transition name="fade">
      <!-- Reusing components introduces all kinds of logic headaches that are
        simpler just to... avoid. We avoid this by binding the key to the route path -->
      <router-view
        v-if="$store.getters.ready"
        class="app-content"
        :key="$route.fullPath"/>
      <div v-else class="loading-overlay is-full-page is-active">
        <div class="loading-icon"/>
      </div>
    </transition>
  </div>
</template>

<script>

export default {
  name: 'App',
  computed: {
    rootStyle() {
      let styles = {};
      // If readability mode is active, unset stylized text
      if (this.$store.state.settings.readability) {
        styles = {...styles, '--font-stylized': 'initial'};
      }
      return styles;
    }
  }
}
</script>
