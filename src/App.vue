<template>
  <div id="app">
    <transition name="slide-prev">
      <router-view v-if="$route.meta.transitory"/>
      <div v-else class="main">
        <b-navbar>

          <!-- Items rendered at beginning of navbar -->
          <template #start>
            <b-navbar-item tag="router-link" :to="{ name: 'Dashboard' }">
              {{ $translation.get('navbar.dashboard') }}
            </b-navbar-item>
            <b-navbar-item tag="router-link" :to="{ name: 'RandomPoem' }">
              {{ $translation.get('navbar.randompoem') }}
            </b-navbar-item>
          </template>

          <template #brand>
            <b-navbar-item tag="router-link" :to="{ name: 'Splash' }">
              <img :src="$assets.getTexture('Logo')"/>
            </b-navbar-item>
          </template>

        </b-navbar>
        <transition name="slide-prev">
          <router-view class="inner"/>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
