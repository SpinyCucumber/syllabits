<template>
  <div id="app">
    <router-view v-if="$route.meta.transitory"/>
    <div v-else class="main">
      <b-navbar>

        <!-- Items rendered at beginning of navbar -->
        <template #start>
          <b-navbar-item tag="router-link" :to="{ name: 'Dashboard' }">
            {{ $translation.get('navbar.dashboard') }}
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ name: 'RandomPoem' }">
            {{ $translation.get('navbar.random-poem') }}
          </b-navbar-item>
        </template>

        <template #brand>
          <b-navbar-item>
            <img :src="$assets.getIcon('Logo', 'png')"/>
          </b-navbar-item>
        </template>

      </b-navbar>
      <router-view class="inner"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
