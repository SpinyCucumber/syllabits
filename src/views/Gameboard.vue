<template>

    <scene type="is-aligned has-scroll">

        <template #static-area>
            <!-- Block picker "drawer" -->
            <div class="block-dropdown">
                <game-dropdown :has-handle="true">
                    <block-picker/>
                </game-dropdown>
            </div>

            <div class="progress-dropdown" v-if="progress">
                <game-dropdown :trigger="progress.numCorrect">
                    <game-progress
                        :max-value="poem.lines.length"
                        :value="progress.numCorrect"
                        type="is-rounded"/>
                </game-dropdown>
            </div>

            <div class="save-dropdown" v-if="mode === 'edit' && poem">
                <transition name="dropdown">
                    <b-button
                        v-if="!original"
                        type="is-primary"
                        size="is-large"
                        @click="save"
                        :label="$translation.get('button.poem.save')"/>
                    <b-button
                        v-else-if="transforms.length > 0"
                        type="is-primary"
                        size="is-large"
                        @click="saveChanges"
                        :label="$translation.get('button.poem.savechanges')"/>
                </transition>
            </div>

        </template>

        <template #content-area>

            <transition name="fade" mode="out-in">
                <div :class="classes">
                    <div class="toolbar">
                        <!-- "Cheat" utils -->
                        <transition name="fade">
                            <div v-if="showCheats && mode === 'play'" class="toolbar-start">
                                <b-button
                                    type="is-primary"
                                    :label="$translation.get('button.oncomplete')"
                                    @click="onComplete"/>
                                <b-button
                                    type="is-primary"
                                    :label="$translation.get('button.oncorrect')"
                                    @click="onCorrect"/>
                            </div>
                        </transition>
                        <transition-group name="list" tag="div" class="toolbar-end">
                            <b-button
                                v-for="button in filteredButtons"
                                :key="button.key"
                                v-bind="button.options"
                                v-on="button.listeners"/>
                        </transition-group>
                    </div>
                    
                    <transition name="fade">
                        <div v-if="poem" class="poem">

                            <div class="title-box">
                                <editable v-model="poem.title"
                                    tag="h1"
                                    custom-class="title"
                                    label-key="title"
                                    :control-options="{
                                        size: 'is-large',
                                        'custom-class': 'has-text-centered',
                                        placeholder: $translation.get('placeholder.poem.title'),
                                    }"
                                    v-slot="{value}">
                                    {{ value }}
                                </editable>
                                <editable v-model="poem.author"
                                    custom-class="subtitle"
                                    label-key="author"
                                    :control-options="{
                                        'custom-class': 'has-text-centered',
                                        placeholder: $translation.get('placeholder.poem.author'),
                                    }"
                                    v-slot="{value}">
                                    {{ value }}
                                </editable>
                            </div>

                            <img v-if="mode === 'play'" :src="$assets.getIcon('divider')" class="divider"/>

                            <!-- Include category input in edit mode -->
                            <b-field class="poem-categories" v-if="mode === 'edit'">
                                <category-input v-model="poem.categories" allow-new/>
                            </b-field>

                            <!-- Poem lines -->
                            <transition-group tag="div" class="body" name="list">
                                <poem-line
                                    v-for="line in sortedLines"
                                    :key="line.id"
                                    v-bind="lineBindings(line)"
                                    @correct="onCorrect"
                                    @incorrect="onIncorrect"/>
                            </transition-group>

                        </div>
                    </transition>
                    <!-- Poem complete dialog -->
                    <b-modal
                        v-model="showComplete"
                        has-modal-card>
                        <template v-slot="{ close }">
                            <poem-complete @close="close"/>
                        </template>
                    </b-modal>
                </div>
            </transition>

        </template>

        <template #background-area>
            <background-image v-if="mode === 'edit'" :src="$assets.getTexture('relief1')" class="muted"/>
        </template>

    </scene>
</template>

<script>
import { PlayPoem, EditPoem, UpdatePoem, CreatePoem, SubmitLine, ResetProgress } from '@/queries'
import {
    BlockPicker,
    PoemLine,
    Scene,
    Editable,
    GameProgress,
    GameDropdown,
    BackgroundImage,
    CategoryInput,
} from '@/components'
import { Constants, AssetService, ReminderService } from '@/services'
import { TrackChanges } from '@/mixins'
import { PoemLocation } from '@/utilities'
import ObjectID from 'bson-objectid'
import store from '@/store'
import useSound from 'vue-use-sound'
import Vue from 'vue'

const { LineState, LocationType } = Constants;

/**
 * Creates an empty line
 */
function makeLine() {
    return {
        id: ObjectID().toHexString(),
        text: '',
        key: new Array(5).fill(''),
        stanzaBreak: false,
    }
}

/**
 * A component that renders a "poem complete" dialog
 * Can be easily connected to a Buefy modal
 */
const PoemComplete = Vue.component('PoemComplete', {

    methods: {
        anotherPoem() {
            this.$router.push({name: 'RandomPoem'});
            this.$emit('close');
        },
        dashboard() {
            this.$router.push({name: 'Dashboard'});
            this.$emit('close');
        },
        buttons() {
            let buttons = [
                <b-button type="is-primary"
                    onClick={this.anotherPoem}
                    label={this.$translation.get('button.anotherpoem')}/>
            ];
            if (this.$store.getters.hasIdentity) buttons = [...buttons,
                <b-button type="is-primary"
                    onClick={this.dashboard}
                    label={this.$translation.get('button.dashboard')}/>
            ];
            return buttons;
        },
    },

    render() {
        return (
            <div class="modal-simple">
                <header class="modal-simple-head">
                    <p class="modal-simple-title">{this.$translation.get("play.complete")}</p>
                </header>
                <footer class="modal-simple-foot">
                    {this.buttons()}
                </footer>
            </div>
        )
    }

});

export default {

    name: 'Gameboard',
    components: {
        BlockPicker,
        PoemLine,
        Scene,
        Editable,
        GameProgress,
        GameDropdown,
        BackgroundImage,
        PoemComplete,
        CategoryInput,
    },

    props: {
        mode: { default: 'play' }, // Valid values are 'play' or 'edit'
        location: { type: String }, // Used for play mode. Determines play "context"
        poemID: { type: String }, // Used for edit mode
    },

    mixins: [
        // In edit mode, we track the changes made to the poem by comparing to an original copy
        TrackChanges({
            toTrack: 'poem',
            excludeFields: ['progress', '__typename', 'location']
        }),
    ],

    setup() {
        // Load sounds
        const [ correct ] = useSound(AssetService.getSound('Correct'));
        const [ incorrect ] = useSound(AssetService.getSound('Incorrect'));
        const [ complete ] = useSound(AssetService.getSound('Complete'));
        return { sounds: { correct, incorrect, complete } };
    },

    created() {
        // If user is not logged in (playing as guest), we send them a polite reminder
        if (!store.getters.hasIdentity) ReminderService.show('playingasguest');
        // We also send a quick message if edit mode is enabled
        if (this.mode === 'edit') ReminderService.show('editmode');
        // Setup!
        this.setup();
    },

    data() {
        return {
            poem: null, // Loaded poem. Contains line text, numbers, title, etc.
            progress: null, // Used to track user progress in play mode
            showComplete: false, // Whether the 'poem complete' dialog is being shown
            buttons: [
                {
                    key: 'help',
                    options: { type: 'is-primary', 'icon-left': 'help', },
                    listeners: { click: this.showHelp, },
                },
                {
                    key: 'edit',
                    options: { type: 'is-dark', 'icon-left': 'hammer-wrench', },
                    listeners: { click: () => {
                        this.$router.push({ name: 'Edit', params: { poemID: this.poem.id }});
                    } },
                    shouldShow: () => this.mode === 'play' && store.getters.isAdmin
                },
                {
                    key: 'play',
                    options: { type: 'is-dark', 'icon-left': 'controller-classic', },
                    listeners: { click: () => {
                        let location = this.poem.location ||
                            new PoemLocation({t: LocationType.Direct, p: this.poem.id}).encode();
                        this.$router.push({ name: 'Play', params: { location: location }});
                    } },
                    shouldShow: () => this.mode === 'edit'
                },
                {
                    key: 'reset',
                    options: { type: 'is-danger', 'icon-left': 'delete', },
                    listeners: { click: this.confirmResetProgress, },
                    shouldShow: () => this.progress?.saved,
                },
            ],
            // A list of actions avaliable for each poem line in edit mode
            lineActions: [
                {
                    key: 'addstanzabreak',
                    apply: (line) => { line.stanzaBreak = true; },
                    shouldShow: (line) => line.stanzaBreak === false,
                },
                {
                    key: 'removestanzabreak',
                    apply: (line) => { line.stanzaBreak = false; },
                    shouldShow: (line) => line.stanzaBreak === true,
                },
                {
                    key: 'moveup',
                    icon: 'arrow-up',
                    apply: (line) => {
                        let predecessor = this.sortedLines[line.order - 1];
                        predecessor.order += 1;
                        line.order -= 1;
                    },
                    shouldShow: (line) => line.order > 0,
                },
                {
                    key: 'movedown',
                    icon: 'arrow-down',
                    apply: (line) => {
                        let successor = this.sortedLines[line.order + 1];
                        successor.order -= 1;
                        line.order += 1;
                    },
                    shouldShow: (line) => line.order < (this.poem.lines.length - 1),
                },
                {
                    key: 'insert',
                    icon: 'plus',
                    options: { class: 'has-text-success' },
                    apply: (line) => {
                        // Create a new line below this one
                        // We have to generate a temporary ID
                        // TODO Could add support for customizable number of feet
                        let newLine = makeLine();
                        newLine.order = line.order + 1,
                        newLine.key._atomic = true;
                        // Move all successive lines down
                        for (let successor of this.sortedLines.slice(line.order + 1)) {
                            successor.order += 1;
                        }
                        this.poem.lines.push(newLine);
                    }
                },
                {
                    key: 'delete',
                    icon: 'delete',
                    options: { class: 'has-text-danger' },
                    apply: (line) => {
                        let {lines} = this.poem;
                        lines.splice(lines.indexOf(line), 1);
                        for (let successor of this.sortedLines.slice(line.order)) {
                            successor.order -= 1;
                        }
                    },
                },
            ],
        }
    },

    methods: {

        /**
         * Properties bound to each poem line
         */
        lineBindings(line) {
            let bindings = ({
                line,
                mode: this.mode,
            });
            // Some bindings are only applicable in play mode
            if (this.mode === 'play') bindings = {
                ...bindings,
                checkHandler: (holding) => this.checkLine(line.id, holding),
                progress: this.progress.lines[line.id],
            }
            // If edit mode is enabled, we bind line actions
            else if (this.mode === 'edit') bindings = {
                ...bindings,
                actions: this.lineActions.filter((action) => action.shouldShow ? action.shouldShow(line) : true)
            }
            return bindings;
        },

        /**
         * Handles checking submitted line answers by querying the server
         */
        checkLine(lineID, answer) {
            // Construct the input to the server
            const input = { poemID: this.poem.id, lineID, answer }
            return this.$apollo.mutate({ mutation: SubmitLine, variables: { input } })
                .then(result => result.data.submitLine)
                .then(result => {
                    // If the user is logged in, then we can assume that data on the server has changed.
                    // Set saved so we can show reset button, etc.
                    if (store.getters.hasIdentity) this.progress.saved = true;
                    return result;
                });
        },

        /**
         * Initializes data structures used to track player progress
         */
        setupProgress() {
            this.progress = {
                numCorrect: 0,
                saved: false,
                lines: Object.fromEntries(this.poem.lines.map(({id, numFeet}) => ([
                    id,
                    {
                        state: LineState.Unchecked,
                        holding: new Array(numFeet).fill(''),
                        attempts: 0,
                    }
                ]))),
            };
        },

        /**
         * Performs all work necessary to start playing/editing,
         * including loading poem from server and initializing data
         */
        setup() {

            if (this.mode === 'play') {
                // Perform server query
                this.$apollo.mutate({mutation: PlayPoem, variables: { location: this.location }})
                    .then(result => result.data.playPoem)
                    .then(({poem, next, previous}) => {
                        // Set poem and initialize progress data
                        this.poem = poem;
                        this.setupProgress();
                        // Update progress from server if applicable
                        const { progress } = poem;
                        if (progress) {
                            this.progress.saved = true;
                            this.progress.numCorrect = progress.numCorrect;
                            progress.lines.forEach(({key, value}) => {
                                let localLine = this.progress.lines[key];
                                // Update holding and state
                                localLine.holding = value.answer;
                                localLine.state = value.correct ? LineState.Correct : LineState.Incorrect;
                            });
                        }
                        // Update navigation links
                        let links = [];
                        if (next) links.push({key: 'next', to: {name: 'Play', params: {location: next}}})
                        if (previous) links.push({key: 'previous', to: {name: 'Play', params: {location: previous}}})
                        this.$emit('update:additionalLinks', links);
                    });
            }

            else if (this.mode === 'edit') {
                // If poemID is specified, query full poem (including keys) from server
                // If not, we create an empty "starter poem"
                if (this.poemID) {
                    this.$apollo.query({ query: EditPoem, variables: { id: this.poemID }, fetchPolicy: 'network-only' })
                        .then(result => result.data.node)
                        .then(poem => {
                            // We 'annotate' the poem for the tracking system,
                            // then we start tracking changes
                            poem._hint = 'Document';
                            poem.lines._hint = 'DocumentList';
                            for (let line of poem.lines) {
                                line.key._atomic = true;
                            }
                            this.poem = poem;
                            this.startTracking();
                        });
                }
                else {
                    this.poem = {
                        title: '',
                        author: '',
                        categories: [],
                        lines: [{...makeLine(), order: 0}],
                    }
                }
            }

        },

        /**
         * If the poem doesn't exist on the server,
         * creates a new poem on the server and initializes its data
         */
        save() {
            // Serialize poem and send to server
            let variables = { data: JSON.stringify(this.poem) };
            this.$apollo.mutate({ mutation: CreatePoem, variables })
                .then(result => result.data.createPoem)
                .then(result => {
                    // If poem was saved successfully, show message and reload view
                    if (result.ok) {
                        this.$buefy.toast.open({
                            message: this.$translation.get('message.poem.savesuccess'),
                            type: 'is-success'
                        });
                        this.$router.push({ name: 'Edit', params: { poemID: result.id }});
                    }
                });
        },

        /**
         * If the poem already exists on the server,
         * updates the poem on the server by sending transforms
         */
        saveChanges() {
            // Update poem on server
            let variables = { id: this.poem.id, transforms: this.transforms.map(JSON.stringify) };
            this.$apollo.mutate({ mutation: UpdatePoem, variables })
                .then(result => result.data.updatePoem)
                .then(result => {
                    // If changes were accepted successfully, show a nice message
                    // and save current state of poem to track future changes
                    if (result.ok) {
                        this.$buefy.toast.open({
                            message: this.$translation.get('message.poem.savechangessuccess'),
                            type: 'is-success'
                        });
                        this.startTracking();
                    }
                });
        },

        showHelp() {
            this.$buefy.dialog.alert(this.$translation.get('dialog.poem.help'));
        },

        confirmResetProgress() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.poem.resetprogress'),
                type: 'is-danger',
                hasIcon: true,
                onConfirm: this.resetProgress,
            })
        },

        resetProgress() {
            const input = { poemID: this.poem.id };
            this.$apollo.mutate({ mutation: ResetProgress, variables: { input } })
                .then(result => result.data.resetProgress)
                .then(result => {
                    // If we've successfully reset progress, show a nice message and clear the slots
                    if (result.ok) {
                        this.$buefy.toast.open({
                            message: this.$translation.get('message.poem.resetsuccess'),
                            type: 'is-danger'
                        });
                        this.setupProgress();
                    }
                })
        },

        onCorrect() {
            // Update numCorrect
            this.progress.numCorrect += 1;
            if (this.progress.numCorrect === this.poem.lines.length) {
                this.onComplete();
            }
            else {
                // Play sound
                this.sounds.correct();
            }
        },

        onComplete() {
            // Play fun sound and show dialog
            this.sounds.complete();
            this.showComplete = true;
        },

        onIncorrect() {
            this.sounds.incorrect();
        },

    },

    computed: {
        classes() {
            return ['gameboard', 'is-mode-' + this.mode];
        },
        allowEditing() {
            return this.mode === 'edit';
        },
        showCheats() {
            return process.env.VUE_APP_SYLLABITS_CHEATS;
        },
        filteredButtons() {
            return this.buttons.filter(button => button.shouldShow ? button.shouldShow() : true);
        },
        /**
         * Poem lines use a "virtual ordering" to change the order in which they appear without
         * changing the actual order on the backend. We define a "sortedLines" computed property
         * to display the virtual ordering, which is defined the "order" property of each line.
         */
        sortedLines() {
            // Must copy array as Array.sort is in-place
            return [...this.poem.lines].sort((a, b) => a.order - b.order);
        },
    },

}
</script>