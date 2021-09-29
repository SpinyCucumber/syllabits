<template>
  <div id="app">
    <router-view v-if="$route.meta.transitory"/>
    <div v-else class="main">
      <b-navbar>

        <!-- Items rendered at beginning of navbar -->
        <template #start>
          <b-navbar-item tag="router-link" :to="{ name: 'Dashboard' }">
            Dashboard
          </b-navbar-item>
          <b-navbar-item tag="a" @click="randomPoem">
            Random Poem
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
import randomPoemIdQuery from '@/queries/randomPoemID.gql'

export default {
  name: 'App',
  methods: {
    randomPoem() {
      // Execute query
      // We have to make sure to not cache the result, since random-poem is 
      this.$apollo.mutate({ mutation: randomPoemIdQuery })
        .then(result => result.data.randomPoem.id)
        .then(id => {
          // Transition to play page with the new poem ID
          this.$router.push({ name: 'Play', params: { poemID: id }});
        });
    }
  }
}
</script>
