<template>
    <navbar-view>
        <scene type="is-aligned has-scroll">

            <template #static-area>

                <div class="save-dropdown" v-if="mode === 'edit' && page">
                    <transition name="dropdown">
                        <b-button
                            v-if="allowSave"
                            type="is-primary"
                            size="is-large"
                            @click="save"
                            :label="$translation.get('button.page.save')"/>
                        <b-button
                            v-else-if="allowSaveChanges"
                            type="is-primary"
                            size="is-large"
                            @click="saveChanges"
                            :label="$translation.get('button.page.savechanges')"/>
                    </transition>
                </div>

            </template>

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
                        <div v-if="error" class="submenu is-centered mt-auto mb-auto">
                            <h1 class="subtitle"> {{ $translation.get('message.page.error') }} </h1>
                        </div>
                        <div class="submenu gap-1" v-else-if="page">
                            <transition name="fade" mode="out-in">
                                <h1 class="title" :key="page.name"> {{ page.name }} </h1>
                            </transition>
                            <b-field grouped group-multiline v-if="mode === 'edit'">
                                <b-field
                                    :label="$translation.get('label.name')"
                                    :message="$translation.get('hint.page.name')"
                                    label-position="on-border">
                                    <b-input
                                        :placeholder="$translation.get('placeholder.page.name')"
                                        :lazy="true"
                                        v-model="page.name"/>
                                </b-field>
                                <b-field
                                    :label="$translation.get('label.path')"
                                    :message="$translation.get('hint.page.path')"
                                    label-position="on-border">
                                    <b-input
                                        :placeholder="$translation.get('placeholder.page.path')"
                                        :lazy="true"
                                        v-model="page.path"/>
                                </b-field>
                                <b-field
                                    :message="$translation.get('hint.page.public')">
                                    <b-switch v-model="page.public">{{ $translation.get('label.public') }}</b-switch>
                                </b-field>
                            </b-field>
                            <editor :init="editorOptions" v-model="page.content" v-if="mode === 'edit'"/>
                            <div v-html="page.content" v-else-if="mode === 'view'"/>
                        </div>
                    </transition>
                </div>
            </template>

            <template #background-area>
                <background-image v-if="mode === 'view'" :src="$assets.getTexture('paper4')" class="muted"/>
                <background-image v-else-if="mode === 'edit'" :src="$assets.getTexture('relief1')" class="muted"/>
            </template>

        </scene>
    </navbar-view>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import { Scene, BackgroundImage } from '@/components'
import { TrackChanges } from '@/mixins'
import { Document } from '@/utilities/tracking'
import { CreatePage, ViewPage, UpdatePage, DeletePage } from '@/queries'
import NavbarView from './NavbarView'
import store from '@/store'

export default {

    name: 'Page',
    components: { Scene, NavbarView, BackgroundImage, Editor, },

    props: {
        mode: { type: String, default: 'view' }, // May be 'view' or 'edit'
        path: String // May be a page path (such as 'about', 'guide', etc.) or a page ID
    },

    mixins: [
        TrackChanges({
            toTrack: 'page',
            handler: new Document(),
            excludeFields: ['__typename'],
        }),
    ],

    setup() {
        return {
            editorOptions: {
                menubar: false,
                height: 600,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                ],
                toolbar:
                    'undo redo | formatselect | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help'
            },
        }
    },

    data() {
        return {
            page: null,
            saved: false,
            error: null, // Whether an error was encountered while loading
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
                    shouldShow: () => this.mode === 'edit' && this.saved
                },
                {
                    key: 'delete',
                    options: { type: 'is-danger', 'icon-left': 'delete', },
                    listeners: { click: this.confirmDelete, },
                    shouldShow: () => this.mode === 'edit' && this.saved && store.getters.perms.has('page.delete')
                },
            ]
        }
    },

    async created() {
        // If path is specified, load page from server
        if (this.path) {
            this.page = (await this.$apollo.query({
                query: ViewPage, variables: { path: this.path }
            })).data.page;
            // If page doesn't exist, set error status
            if (!this.page) this.error = true;
            // If we're editing, start tracking changes and mark poem as saved
            else if (this.mode === 'edit') {
                this.saved = true;
                this.makeSnapshot();
            }
        }
        // If path is NOT specified in edit mode, create a blank page
        else if (this.mode === 'edit') {
            this.page = {};
            this.saved = false;
        }
    },

    methods: {

        edit() {
            // Use ID to reference page in edit mode
            this.$router.push({ name: 'Page', params: { path: this.page.id }, query: { mode: 'edit' }});
        },

        view() {
            this.$router.push({ name: 'Page', params: { path: this.page.path }});
        },

        /**
         * If the page doesn't exist on the server,
         * creates a new page on the server and initializes its data
         */
        async save() {
            // Serialize data and send to server
            let variables = { data: JSON.stringify(this.page) };
            let { ok, id } = (await this.$apollo.mutate({ mutation: CreatePage, variables })).data.createPage;
            // If page was saved successfully, show message and reload view
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.page.savesuccess'),
                    type: 'is-success'
                });
                this.$router.push({ name: 'Page', params: { path: id }, query: { mode: 'edit', }});
            }
        },

        /**
         * If the page already exists on the server,
         * updates the page on the server by sending transforms
         */
        async saveChanges() {
            // Update page on server
            let variables = { id: this.page.id, transforms: this.transforms.map(JSON.stringify) };
            let { ok }  = (await this.$apollo.mutate({ mutation: UpdatePage, variables })).data.updatePage;
            // If changes were accepted successfully, show a nice message
            // and save current state
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.page.savechangessuccess'),
                    type: 'is-success'
                });
                this.makeSnapshot();
            }
        },

        async confirmDelete() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.page.delete'),
                type: 'is-danger',
                hasIcon: true,
                onConfirm: this.delete,
            });
        },

        /**
         * Deletes a saved page from the server
         */
        async delete() {
            const variables = { id: this.page.id };
            let { ok } = (await this.$apollo.mutate({ mutation: DeletePage, variables })).data.deletePage;
            // If we've successfully deleted the page, show a nice message and navigate back
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.page.deletesuccess'),
                    type: 'is-danger'
                });
                this.$router.back();
            }
        },

    },

    computed: {
        filteredButtons() {
            return this.buttons.filter(button => button.shouldShow ? button.shouldShow() : true);
        },
        allowSave() {
            return !this.saved && this.page.name && this.page.path && store.getters.perms.has('page.create');
        },
        allowSaveChanges() {
            return this.saved && this.transforms.length > 0 && store.getters.perms.has('page.edit');
        },
        allowEditing() {
            return this.mode === 'edit';
        },
    },

}
</script>