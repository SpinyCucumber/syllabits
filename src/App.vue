<template>
  <div id="app" class="full-height">
    <router-view v-if="$route.meta.transitory"/>
    <div v-else class="is-flex is-flex-direction-column full-height">
      <b-navbar>

        <!-- Items rendered at beginning of navbar -->
        <template #start>
          <b-navbar-item tag="router-link" :to="{ name: 'Dashboard' }">
            Dashboard
          </b-navbar-item>
          <!-- TODO -->
          <b-navbar-item tag="a" @click="randomPoem">
            Random Poem
          </b-navbar-item>
        </template>

        <template #brand>
          <b-navbar-item>
            <!-- TODO Replace with logo -->
            ProtoSyllabits
          </b-navbar-item>
        </template>

      </b-navbar>
      <router-view class="is-flex-grow-1"/>
    </div>
  </div>
</template>

<script>
import randomPoemId from '@/queries/randomPoemID.gql'

export default {
  name: 'App',
  methods: {
    randomPoem() {
      // Execute query
      this.$apollo.query({ query: randomPoemId })
        .then(result => result.data.randomPoem.id)
        .then(id => {
          // Transition to play page with the new poem ID
          this.$router.push({ name: 'Play', params: { id: id }});
        });
    }
  }
}
</script>
