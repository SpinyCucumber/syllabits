<template>
    <navbar-view>
        <scene type="is-aligned">

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
                        <div class="submenu gap-1" v-if="page">
                            <editable v-model="page.name"
                                class="align-self-start"
                                tag="h1"
                                custom-class="title"
                                label-key="name"
                                :control-options="{
                                    size: 'is-large',
                                    placeholder: $translation.get('placeholder.page.name'),
                                    lazy: true,
                                }"
                                v-slot="{value}">
                                {{ value }}
                            </editable>
                            <b-field grouped group-multiline v-if="mode === 'edit'">
                                <b-field
                                    :label="$translation.get('label.path')"
                                    :message="$translation.get('hint.page.path')"
                                    label-position="on-border">
                                    <b-input
                                        :lazy="true"
                                        v-model="page.path"/>
                                </b-field>
                            </b-field>
                            <editor :init="editorOptions" v-model="page.content" v-if="mode === 'edit'"/>
                            <div v-html="page.content" v-else-if="mode === 'view'"/>
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
import Editor from '@tinymce/tinymce-vue'
import { Scene, BackgroundImage, Editable } from '@/components'
import { TrackChanges } from '@/mixins'
import { Document } from '@/utilities/tracking'
import { CreatePage, ViewPage, UpdatePage } from '@/queries'
import NavbarView from './NavbarView'
import store from '@/store'

export default {

    name: 'Page',
    components: { Scene, NavbarView, BackgroundImage, Editor, Editable, },

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
        // If path is specified, load page from server
        if (this.path) {
            this.page = (await this.$apollo.query({
                query: ViewPage, variables: { path: this.path }
            })).data.page;
            // If we're editing, start tracking changes and mark poem as saved
            if (this.mode === 'edit') {
                this.saved = true;
                this.makeSnapshot();
            }
        }
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

    },

    computed: {
        filteredButtons() {
            return this.buttons.filter(button => button.shouldShow ? button.shouldShow() : true);
        },
        allowSave() {
            return !this.saved && this.page.name && store.getters.perms.has('page.create');
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