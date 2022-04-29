<template>
    <div class="vertical-grow">

        <b-navbar>

            <!-- Items rendered at beginning of navbar -->
            <template #start>
                <transition-group name="list" tag="div" class="is-flex">
                    <b-navbar-item
                        v-for="link in filteredLinks"
                        tag="router-link"
                        :key="link.key"
                        v-bind="link">
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
                        <p class="has-text-grey">{{ $store.getters.email }}</p>
                        <role-tag :role="$store.getters.role"/>
                        <div class="submenu-footer">
                            <b-button type="is-danger" inverted :label="$translation.get('button.logout')" @click="confirmLogout"/>
                        </div>
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
        <slot/>

    </div>
</template>

<script>
import { Settings, RoleTag } from '@/components'
import { Logout } from '@/queries'

/**
 * An abstract view that displays a navbar at the top of the page
 */
export default {

    components: { Settings, RoleTag },

    props: {
        extraLinks: { default: () => [] },
    },

    data() {
        return {
            baseLinks: [
                { to: { name: 'Find' }, key: 'find' },
                { to: { name: 'RandomPoem' }, key: 'randompoem' },
                { to: { name: 'Edit', }, key: 'edit', shouldShow: () => this.$store.getters.perms.has('poem.edit') },
                { to: { name: 'ManageUsers', }, key: 'manageusers', shouldShow: () => this.$store.getters.perms.has('user.manage'), }
            ],
        }
    },

    computed: {
        allLinks() {
            return this.baseLinks.concat(this.extraLinks);
        },
        filteredLinks() {
            return this.allLinks.filter(link => link.shouldShow ? link.shouldShow() : true);
        },
    },

    methods: {

        async confirmLogout() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.logout'),
                type: 'is-danger',
                onConfirm: this.logout,
            });
        },

        async logout() {
            let { ok } = (await this.$apollo.mutate({ mutation: Logout })).data.logout;
            if (ok) {
                this.$store.dispatch('clearIdentity');
                // Navigate back to splash
                this.$router.push({name: 'Splash'});
            }
        },

    },

}
</script>