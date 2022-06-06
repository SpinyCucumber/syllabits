<template>
    <div class="vertical-grow">

        <b-navbar>

            <!-- Items rendered at beginning of navbar -->
            <template #start>

                <!-- Static Links -->
                <b-navbar-item tag="router-link" :to="{ name: 'Browse', query: { tab: 'poems' } }">
                    {{ $translation.get('navbar.findpoem') }}
                </b-navbar-item>
                <b-navbar-item tag="router-link" :to="{ name: 'RandomPoem' }">
                    {{ $translation.get('navbar.randompoem') }}
                </b-navbar-item>
                <b-navbar-item v-if="$store.getters.perms.has('poem.edit')"
                    tag="router-link" :to="{ name: 'Gameboard', query: { mode: 'edit', }}">
                    {{ $translation.get('navbar.editpoem') }}
                </b-navbar-item>
                <b-navbar-dropdown v-if="showAdminTools" :label="$translation.get('navbar.admin')" boxed>
                    <b-navbar-item tag="router-link" :to="{ name: 'Browse', query: { tab: 'users' }}">
                        {{ $translation.get('navbar.manageusers') }}
                    </b-navbar-item>
                    <b-navbar-item tag="router-link" :to="{ name: 'Browse', query: { tab: 'pages' }}">
                        {{ $translation.get('navbar.managepages') }}
                    </b-navbar-item>
                    <b-navbar-item tag="router-link" :to="{ name: 'Page', query: { mode: 'edit', }}">
                        {{ $translation.get('navbar.editpage') }}
                    </b-navbar-item>
                </b-navbar-dropdown>

                <!-- Dynamic Links -->
                <transition-group name="list" tag="div" class="is-flex">
                    <b-navbar-item
                        v-for="link in dynamicLinks"
                        :key="link.key"
                        v-bind="link">
                        {{ link.name || $translation.get('navbar.' + link.key) }}
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
                            <role-tag v-if="showRole" :role="$store.getters.role"/>
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
import { Constants } from '@/services'
import { Logout, PublicPages } from '@/queries'
const { Role } = Constants;

/**
 * An abstract view that displays a navbar at the top of the page
 */
export default {

    components: { Settings, RoleTag },

    props: {
        extraLinks: { default: () => [] },
    },

    apollo: {
        publicPages: {
            query: PublicPages,
        },
    },

    computed: {
        pageLinks() {
            return this.publicPages.map(page => ({
                to: { name: 'Page', params: { path: page.path } },
                tag: 'router-link',
                key: page.path,
                name: page.name,
            }));
        },
        dynamicLinks() {
            let links = this.extraLinks;
            if (this.publicPages) links = [...links, ...this.pageLinks];
            return links;
        },
        showRole() {
            return this.$store.getters.role !== Role.USER;
        },
        showAdminTools() {
            return this.$store.getters.role === Role.ADMIN;
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