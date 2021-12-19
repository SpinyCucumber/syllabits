<template>
  <div id="app" :style="rootStyle">
    <transition name="fade" mode="out-in">
      <div v-if="$store.getters.determined" class="full-height" key="determined">
        <transition name="fade" mode="out-in">
          <router-view v-if="$route.meta.transitory" class="app-view"/>
          <div v-else class="app-view main-view">
            <b-navbar>

              <!-- Items rendered at beginning of navbar -->
              <template #start>
                <transition-group name="list" tag="div" class="is-flex">
                  <b-navbar-item
                    v-for="link in allLinks"
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
                  <b-navbar-item tag="div">
                    <div class="submenu is-centered">
                      <b-icon icon="account-circle" size="is-large"/>
                      <p class="subtitle">{{ $store.getters.claims.email }}</p>
                      <b-button type="is-danger" :label="$translation.get('button.logout')" @click="confirmLogout"/>
                    </div>
                  </b-navbar-item>
                </b-navbar-dropdown>
                <b-navbar-dropdown arrowless right boxed>
                  <template #label><b-icon icon="cog"/></template>
                  <b-navbar-item tag="div">
                    <settings/>
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
      <div v-else class="loading-overlay is-full-page is-active">
        <div class="loading-icon"/>
      </div>
    </transition>
  </div>
</template>

<script>
import { Settings } from '@/components'
import { logout as logoutQuery } from '@/queries'

export default {
  name: 'App',
  components: { Settings },
  data() {
    return {
      baseLinks: [
        { to: { name: 'Find' }, key: 'find' },
        { to: { name: 'RandomPoem' }, key: 'randompoem' },
      ],
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
      this.$apollo.mutate({ mutation: logoutQuery })
        .then(result => result.data.logout)
        .then(({ok}) => {
          if (ok) {
            this.$store.dispatch('clearIdentity');
            // Navigate back to splash
            this.$router.push({name: 'Splash'});
          }
        });
    },
  },
  computed: {
    allLinks() {
      return this.baseLinks.concat(this.additionalLinks);
    },
    showCheats() {
      return process.env.VUE_APP_SYLLABITS_CHEATS;
    },
    rootStyle() {
      let styles = {};
      // If readability mode is active, unset stylized text
      if (this.$store.state.settings.readability) {
        styles['--font-stylized'] = 'initial';
      }
      return styles;
    }
  }
}
</script>
