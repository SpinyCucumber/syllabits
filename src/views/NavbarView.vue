<template>
    <div class="navbar-view">

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
                <b-navbar-dropdown v-if="$store.getters.isAdmin" :label="$translation.get('navbar.admin')">
                    <b-navbar-item tag="router-link" :to="{name: 'Edit'}">
                    <!-- Could include a "my poems" view in the future to better manage creating/editing poems -->
                    {{ $translation.get('navbar.edit') }}
                    </b-navbar-item>
                </b-navbar-dropdown>
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
                    <img :src="$assets.getTexture('logo')"/>
                </b-navbar-item>
            </template>

        </b-navbar>

        <!-- Content goes here! -->
        <div class="navbar-view-content">
            <slot/>
        </div>

    </div>
</template>

<script>
import { Settings } from '@/components'

/**
 * An abstract view that displays a navbar at the top of the page
 */
export default {

    components: { Settings },

    props: {
        extraLinks: [],
    },

    data() {
        return {
            baseLinks: [
                { to: { name: 'Find' }, key: 'find' },
                { to: { name: 'RandomPoem' }, key: 'randompoem' },
            ],
        }
    },

    computed: {
        allLinks() {
            return this.baseLinks.concat(this.additionalLinks);
        },
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
            this.$apollo.mutate({ mutation: Logout })
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

}
</script>