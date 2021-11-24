<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <div v-if="!$store.getters.determined" class="loading-overlay is-full-page is-active" key="loading">
        <div class="loading-icon"/>
      </div>
      <router-view v-else-if="$route.meta.transitory" key="transitory"/>
      <div v-else class="main" key="main">
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

          <template #end>
            <b-navbar-dropdown arrowless right boxed
              v-if="$store.getters.hasIdentity">
              <template #label><b-icon icon="account"/></template>
              <b-navbar-item tag="div" class="submenu">
                <b-icon icon="account-circle" size="is-large"/>
                <p class="subtitle">{{ $store.getters.claims.email }}</p>
                <b-button type="is-danger" :label="$translation.get('button.logout')" @click="confirmLogout"/>
                <b-button type="is-info" v-if="showCheats" :label="$translation.get('button.refresh')" @click="refresh"/>
              </b-navbar-item>
            </b-navbar-dropdown>
            <b-navbar-dropdown arrowless right boxed>
              <template #label><b-icon icon="cog"/></template>
              <b-navbar-item>
                TODO
              </b-navbar-item>
            </b-navbar-dropdown>
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
  methods: {
    confirmLogout() {
      this.$buefy.dialog.confirm({
        ...this.$translation.get('dialog.logout'),
        type: 'is-danger',
        onConfirm: this.logout,
      });
    },
    logout() {
      this.$store.dispatch('clearIdentity');
      // Navigate back to splash
      this.$router.push({name: 'Splash'});
    },
    refresh() {
      
    },
  },
  computed: {
    showCheats() {
      return process.env.VUE_APP_SYLLABITS_CHEATS;
    },
  }
}
</script>
