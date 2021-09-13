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
      <router-view class="is-flex-grow-1"/>
    </div>
  </div>
</template>
