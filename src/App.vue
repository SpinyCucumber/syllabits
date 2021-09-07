<template>
  <div id="app" class="full-height">
    <router-view v-if="$route.meta.transitory"/>
    <div v-else class="is-flex is-flex-direction-column full-height">
      <b-navbar type="is-primary">

        <!-- Items rendered at beginning of navbar -->
        <template #start>
          <b-navbar-item tag="router-link" :to="{ name: 'Dashboard' }">
            Dashboard
          </b-navbar-item>
          <!-- TODO -->
          <b-navbar-item tag="a">
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
      <router-view class="is-flex-grow-1 syllabits-content"/>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
