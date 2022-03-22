<template>
    <navbar-view class="gameboard-view" :extra-links="extraLinks">

        <scene class="navbar-view-content" type="is-aligned has-scroll">

            <template #static-area>
                <!-- Block picker "drawer" -->
                <div class="block-dropdown">
                    <game-dropdown :has-handle="true" ref="blockDropdown">
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
                            v-if="allowSave"
                            type="is-primary"
                            size="is-large"
                            @click="save"
                            :label="$translation.get('button.poem.save')"/>
                        <b-button
                            v-else-if="saved && transforms.length > 0"
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
                                            lazy: true,
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
                                            lazy: true,
                                        }"
                                        v-slot="{value}">
                                        {{ value }}
                                    </editable>
                                </div>

                                <img v-if="mode !== 'edit'" :src="$assets.getIcon('divider')" class="divider"/>

                                <!-- Include category input in edit mode -->
                                <b-field class="poem-categories" v-if="mode === 'edit'">
                                    <category-input v-model="poem.categories" allow-new/>
                                </b-field>

                                <!-- Poem lines -->
                                <transition-group tag="div" class="body" name="list">
                                    <poem-line
                                        ref="lines"
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

    </navbar-view>
</template>

<script>
import { PlayPoem, EditPoem, UpdatePoem, CreatePoem, DeletePoem, SubmitLine, ResetProgress } from '@/queries'
import {
    BlockPicker,
    PoemLine,
    Scene,
    Editable,
    GameProgress,
    GameDropdown,
    BackgroundImage,
    CategoryInput,
    PoemComplete,
} from '@/components'
import { Constants, Assets, Reminders } from '@/services'
import { TrackChanges } from '@/mixins'
import { PoemLocation, checkLine } from '@/utilities'
import { Document, List, DocumentList } from '@/utilities/tracking'
import NavbarView from './NavbarView'
import tutorialPoem from '/tutorial-poem'
import tutorial from '@/tutorial'
import store from '@/store'
import Vue from 'vue'
import ObjectID from 'bson-objectid'
import useSound from 'vue-use-sound'

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

export default {

    name: 'Gameboard',

    components: {
        NavbarView,
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
        mode: { default: 'play' }, // Valid values are 'play', 'edit', or 'tutorial'
        location: { type: String }, // Used for play mode. Determines play "context"
        poemID: { type: String }, // Used for edit mode
    },

    mixins: [
        // In edit mode, we track the changes made to the poem by comparing to an original copy
        TrackChanges({
            toTrack: 'poem',
            handler: new Document({
                categories: new List(),
                lines: new DocumentList(new Document(), { idField: 'id' }),
            }),
            excludeFields: ['progress', '__typename', 'location']
        }),
    ],

    setup() {
        // Load sounds
        const [ correct ] = useSound(Assets.getSound('Correct'));
        const [ incorrect ] = useSound(Assets.getSound('Incorrect'));
        const [ complete ] = useSound(Assets.getSound('Complete'));
        return { sounds: { correct, incorrect, complete } };
    },

    created() {
        // Setup!
        this.setup();
    },

    mounted() {
        if (this.mode === 'play') {
            // If user is not logged in (playing as guest), offer to play the tutorial
            if (!store.getters.hasIdentity) Reminders.showDialog('playtutorial', {
                onConfirm: () => { this.$router.push({name: 'Tutorial'}); }
            });
        }
        // We also send a quick message if edit mode is enabled
        else if (this.mode === 'edit') Reminders.showMessage('editmode');
        // If tutorial mode is enabled, start the tutorial
        else if (this.mode === 'tutorial') {
            const vm = this;
            const store = {};
            const advance = () => {
                if ((this.tutorialProgress += 1) === tutorial.steps.length)
                    this.onTutorialComplete();
                else this.currentStep.start({advance, vm, store});
            };
            this.currentStep.start({advance, vm, store});
        }
    },

    data() {
        return {
            poem: null, // Loaded poem. Contains line text, numbers, title, etc.
            progress: null, // Used to track user progress in play mode
            showComplete: false, // Whether the 'poem complete' dialog is being shown
            saved: false, // Whether the poem actually exists on the server (only in edit mode)
            nextPoem: null, // For each 'play context', the server can specify a next and previous poem. (only in play mode)
            previousPoem: null,
            tutorialProgress: null, // Tracks current step (only in tutorial mode)
            lineOptions: null, // Additional line bindings which can be manually. specified
            buttons: [
                {
                    key: 'help',
                    options: { type: 'is-primary', 'icon-left': 'help', },
                    listeners: { click: this.showHelp, },
                    shouldShow: () => this.mode !== 'tutorial',
                },
                {
                    key: 'helptutorial',
                    options: { type: 'is-primary', 'icon-left': 'help', },
                    listeners: { click: this.showHelpTutorial, },
                    shouldShow: () => this.mode === 'tutorial' && this.currentStep.help
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
                    // Poem must exist on server/be saved in order to play
                    shouldShow: () => this.mode === 'edit' && this.saved
                },
                {
                    key: 'reset',
                    options: { type: 'is-danger', 'icon-left': 'restart', },
                    listeners: { click: this.confirmResetProgress, },
                    shouldShow: () => this.progress?.saved,
                },
                {
                    key: 'delete',
                    options: { type: 'is-danger', 'icon-left': 'delete', },
                    listeners: { click: this.confirmDelete, },
                    shouldShow: () => this.mode === 'edit' && this.saved
                }
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
                        let newLine = makeLine();
                        newLine.order = line.order + 1;
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
            // These properties are bounds to lines regardless of gameboard mode
            let bindings = ({
                line,
                mode: (this.mode === 'edit') ? 'edit' : 'play',
                ...(this.lineOptions[line.id] || {}),
            });
            // If edit mode is enabled, we bind line actions
            // Otherwise, bind line progress and check handler
            // Tutorial mode and play mode use different line check handlers
            if (this.mode === 'edit') bindings = {
                ...bindings,
                actions: this.lineActions.filter((action) => action.shouldShow ? action.shouldShow(line) : true)
            }
            else bindings = {
                ...bindings,
                progress: this.progress.lines[line.id],
                checkHandler: (this.mode === 'play') ?
                    (holding) => this.checkLine(line.id, holding) :
                    (holding) => this.checkTutorialLine(line.id, holding),
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
                    // Otherwise show a reminder that progress isn't being saved...
                    if (store.getters.hasIdentity) this.progress.saved = true;
                    else Reminders.showMessage('playingasguest');
                    return result;
                });
        },

        /**
         * Handles checking submitted line answers in tutorial mode
         */
        checkTutorialLine(lineID, answer) {
            return Promise.resolve(checkLine(tutorialPoem.key[lineID], answer));
        },

        /**
         * Initializes data structures used to track player progress
         */
        setupProgress() {
            this.progress = {
                numCorrect: 0,
                saved: false, // Whether the user progress exists on the server
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

            // TODO Use promises here for smarter control flow.
            // We have to do some work after querying server, like setting up line options
            if (this.mode === 'play') {
                // Perform server query
                this.$apollo.mutate({mutation: PlayPoem, variables: { location: this.location }})
                    .then(result => result.data.playPoem)
                    .then(({poem, next, previous}) => {
                        // Set poem and initialize progress data
                        this.poem = poem;
                        this.next = next;
                        this.previous = previous;
                        this.setupProgress();
                        this.setupLineOptions();
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
                    });
            }

            else if (this.mode === 'edit') {
                // If poemID is specified, query full poem (including keys) from server
                // If not, we create an empty "starter poem"
                if (this.poemID) {
                    this.$apollo.query({ query: EditPoem, variables: { id: this.poemID }, fetchPolicy: 'network-only' })
                        .then(result => result.data.node)
                        .then(poem => {
                            this.poem = poem;
                            this.saved = true;
                            this.makeSnapshot();
                            this.setupLineOptions();
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

            else if (this.mode === 'tutorial') {
                this.poem = tutorialPoem;
                this.setupProgress();
                this.setupLineOptions();
                this.tutorialProgress = 0;
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
                    // and save current poem state
                    if (result.ok) {
                        this.$buefy.toast.open({
                            message: this.$translation.get('message.poem.savechangessuccess'),
                            type: 'is-success'
                        });
                        this.makeSnapshot();
                    }
                });
        },

        showHelp() {
            this.$buefy.dialog.alert(this.$translation.get('dialog.poem.help'));
        },

        showHelpTutorial() {
            this.$buefy.dialog.alert({
                ...this.$translation.get('dialog.tutorial.help'),
                message: this.$translation.get('message.help.' + this.currentStep.help),
            });
        },

        confirmResetProgress() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.poem.resetprogress'),
                type: 'is-danger',
                hasIcon: true,
                onConfirm: this.resetProgress,
            });
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

        /**
         * Deletes a saved poem from the server!
         */
        confirmDelete() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.poem.delete'),
                type: 'is-danger',
                hasIcon: true,
                onConfirm: this.delete,
            });
        },

        delete() {
            this.$apollo.mutate({ mutation: DeletePoem, variables: { id: this.poem.id } })
                .then(result => result.data.deletePoem)
                .then(result => {
                    // If we've successfully reset progress, show a nice message and navigate backwards
                    if (result.ok) {
                        this.$buefy.toast.open({
                            message: this.$translation.get('message.poem.deletesuccess'),
                            type: 'is-danger'
                        });
                        this.$router.back();
                    }
                })
        },

        setupLineOptions() {
            this.lineOptions = Object.fromEntries(this.poem.lines.map(({id}) => [id, {}]));
        },

        /**
         * Manually bind a value to a line property
         * This allows lines to be configured from outside the gameboard.
         * Must specify lineID, option name, and new value
         */
        setLineOption(lineID, key, value) {
            let options = this.lineOptions[lineID];
            Vue.set(options, key, value);
        },

        deleteLineOption(lineID, key) {
            let options = this.lineOptions[lineID];
            Vue.delete(options, key);
        },

        onTutorialComplete() {
            // TODO
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
        allowSave() {
            return !this.saved && this.poem.title && this.poem.lines.length > 0;
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
        extraLinks() {
            let links = [];
            if (this.nextPoem) links.push({ key: 'nextpoem', to: { name: 'Play', params: { location: this.nextPoem } } });
            if (this.previousPoem) links.push({ key: 'previouspoem', to: { name: 'Play', params: { location: this.previousPoem } } });
            return links;
        },
        /**
         * Only applicable in tutorial mode
         */
        currentStep() {
            return tutorial.steps[this.tutorialProgress];
        }
    },

}
</script>