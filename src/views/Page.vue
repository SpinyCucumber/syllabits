<template>
    <navbar-view>
        <scene type="is-aligned">

            <template #content-area>
                <div class="page-view">
                    <div class="toolbar">
                        <transition-group name="list" tag="div" class="toolbar-end">
                            <b-button
                                v-for="button in filteredButtons"
                                :key="button.key"
                                v-bind="button.options"
                                v-on="button.listeners"/>
                        </transition-group>
                    </div>
                    <transition name="fade">
                        <div class="submenu gap-1" v-if="page">
                            <b-field grouped group-multiline>
                                <b-field
                                    :label="$translation.get('label.name')"
                                    :message="$translation.get('hint.page.name')"
                                    label-position="on-border">
                                    <b-input
                                        v-model="page.name"/>
                                </b-field>
                                <b-field
                                    :label="$translation.get('label.path')"
                                    :message="$translation.get('hint.page.path')"
                                    label-position="on-border">
                                    <b-input
                                        v-model="page.path"/>
                                </b-field>
                            </b-field>
                            <div v-html="page.content"/>
                        </div>
                    </transition>
                </div>
            </template>

            <template #background-area>
                <background-image v-if="mode === 'edit'" :src="$assets.getTexture('relief1')" class="muted"/>
            </template>

        </scene>
    </navbar-view>
</template>

<script>
import { Scene, BackgroundImage } from '@/components'
import { ViewPage } from '@/queries'
import NavbarView from './NavbarView'
import store from '@/store'

export default {

    name: 'Page',
    components: { Scene, NavbarView, BackgroundImage, },

    props: {
        mode: { type: String, default: 'view' }, // May be 'view' or 'edit'
        path: String // May be a page path (such as 'about', 'guide', etc.) or a page ID
    },

    data() {
        return {
            page: null,
            buttons: [
                {
                    key: 'edit',
                    options: { type: 'is-dark', 'icon-left': 'pencil', },
                    listeners: { click: this.edit },
                    shouldShow: () => this.mode === 'view' && store.getters.perms.has('page.edit') && this.page
                },
                {
                    key: 'view',
                    options: { type: 'is-dark', 'icon-left': 'eye', },
                    listeners: { click: this.view },
                    shouldShow: () => this.mode === 'edit' && this.page
                }
            ]
        }
    },

    async created() {
        // Load page from server
        this.page = (await this.$apollo.query({
            query: ViewPage, variables: { path: this.path }
        })).data.page;
    },

    methods: {
        edit() {
            // Use ID to reference page in edit mode
            this.$router.push({ name: 'Page', params: { path: this.page.id }, query: { mode: 'edit' }});
        },
        view() {
            this.$router.push({ name: 'Page', params: { path: this.page.path }});
        }
    },

    computed: {
        filteredButtons() {
            return this.buttons.filter(button => button.shouldShow ? button.shouldShow() : true);
        },
    },

}
</script>