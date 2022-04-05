<template>
    <navbar-view class="gameboard-view" :extra-links="extraLinks">

        <b-loading v-model="isBusy" :can-cancel="false"/>

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
                    <div :class="classes" ref="gameboard">
                        <div class="toolbar" data-html2canvas-ignore="true">
                            <!-- "Cheat" utils -->
                            <transition name="fade">
                                <div v-if="showCheats" class="toolbar-start">
                                    <b-button
                                        v-if="mode === 'play'"
                                        type="is-primary"
                                        :label="$translation.get('button.oncomplete')"
                                        @click="onComplete"/>
                                    <b-button
                                        v-if="mode === 'play'"
                                        type="is-primary"
                                        :label="$translation.get('button.oncorrect')"
                                        @click="onLineCorrect"/>
                                    <b-button
                                        v-if="mode === 'tutorial'"
                                        type="is-primary"
                                        :label="$translation.get('button.advancetutorial')"
                                        @click="advanceTutorial"/>
                                </div>
                            </transition>
                            <transition-group name="list" tag="div" class="toolbar-end">
                                <b-button
                                    v-for="button in filteredButtons"
                                    ref="buttons"
                                    :key="button.key"
                                    v-bind="button.options"
                                    v-on="button.listeners"/>
                            </transition-group>
                        </div>
                        
                        <transition name="fade">
                            <div v-if="error" class="gameboard-error">
                                <h1 class="title">{{ $translation.get('dialog.poem.error.title') }}</h1>
                                <h2 class="subtitle">{{ errorMessage }}</h2>
                            </div>
                            <div v-else-if="poem" class="poem">

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
                                        @correct="onLineCorrect(line)"
                                        @incorrect="onLineIncorrect(line)"/>
                                </transition-group>

                            </div>
                        </transition>
                        <!-- Poem complete dialog -->
                        <b-modal v-model="showComplete" has-modal-card>
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
import { PoemLocation, checkLine, toTranslationKey } from '@/utilities'
import { Document, List, DocumentList } from '@/utilities/tracking'
import { saveAs } from 'file-saver'
import NavbarView from './NavbarView'
import tutorialPoem from '/tutorial-poem'
import tutorialOptions from '@/tutorial'
import store from '@/store'
import Vue from 'vue'
import ObjectID from 'bson-objectid'
import useSound from 'vue-use-sound'
import html2canvas from 'html2canvas'

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

// TODO Move this to a 'Tutorial' class file
function constructTutorial() {
    let { created, mounted, setup, steps } = tutorialOptions;
    let tutorial = {};
    if (setup) Object.assign(tutorial, setup());
    tutorial.created = created?.bind(tutorial);
    tutorial.mounted = mounted?.bind(tutorial);
    tutorial.steps = steps.map((stepOptions) => {
        let { start, close, created, mounted, setup, ...options } = stepOptions;
        let step = { ...options, tutorial };
        if (setup) Object.assign(step, setup());
        step.start = start?.bind(step);
        step.close = close?.bind(step);
        step.created = created?.bind(step);
        step.mounted = mounted?.bind(step);
        return step;
    });
    return tutorial;
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

    setup(props) {
        let result = {};
        // Load sounds
        const [ correct ] = useSound(Assets.getSound('correct'));
        const [ incorrect ] = useSound(Assets.getSound('incorrect'));
        const [ poemComplete ] = useSound(Assets.getSound('poemcomplete'));
        const [ capture ] = useSound(Assets.getSound('capture'));
        result.sounds = { correct, incorrect, poemComplete, capture, };
        // Construct tutorial
        if (props.mode === 'tutorial') result.tutorial = constructTutorial();
        return result;
    },

    beforeCreate() {
        if (this.$options.propsData.mode === 'edit') {
            // In edit mode, we track the changes made to the poem by comparing to an original copy
            this.$options.mixins = [TrackChanges({
                toTrack: 'poem',
                handler: new Document({
                    categories: new List(),
                    lines: new DocumentList(new Document(), { idField: 'id' }),
                }),
                excludeFields: ['progress', '__typename', 'location']
            })];
        }
    },

    /**
     * Performs all work necessary to start playing/editing,
     * including loading poem from server and initializing data
     */
    async created() {
        
        if (this.mode === 'play') {
            // In a 'play context', we can access the current program data and the locations
            // of the next and previous poems
            let { ok, error, poem, next, previous } = (await this.$apollo.mutate({
                    mutation: PlayPoem, variables: { location: this.location }
                })).data.playPoem;
            if (!ok) {
                this.error = error;
                return;
            }
            // Set poem and initialize progress data
            this.poem = poem;
            this.next = next;
            this.previous = previous;
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
        }

        else if (this.mode === 'edit') {
            // If poemID is specified, query full poem (including keys) from server
            // If not, we create an empty "starter poem"
            if (this.poemID) {
                this.poem = (await this.$apollo.query({
                        query: EditPoem, variables: { id: this.poemID }, fetchPolicy: 'network-only'
                    })).data.node;
                this.saved = true;
                // Save current poem state to track changes
                this.makeSnapshot();
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
        }

        this.setupLineOptions();
        
        // Call tutorial hooks
        if (this.mode === 'tutorial') {
            if (this.tutorial.created) this.tutorial.created({ vm: this });
            for (let step of this.tutorial.steps) {
                if (step.created) step.created({ vm: this });
            }
        }

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
            // Call tutorial hooks and step hooks first
            if (this.tutorial.mounted) this.tutorial.mounted({ vm: this });
            for (let step of this.tutorial.steps) {
                if (step.mounted) step.mounted({ vm: this });
            }
            this.startTutorial();
        }
    },

    data() {
        return {
            poem: null, // Loaded poem. Contains line text, numbers, title, etc.
            progress: null, // Used to track user progress in play mode
            showComplete: false, // Whether the 'poem complete' dialog is being shown
            preparingCapture: false, // Whether a poem capture is currently being prepared
            saved: false, // Whether the poem actually exists on the server (only in edit mode)
            nextPoem: null, // For each 'play context', the server can specify a next and previous poem. (only in play mode)
            previousPoem: null,
            tutorialProgress: null, // Tracks current step (only in tutorial mode)
            lineOptions: null, // Additional line bindings which can be manually. specified
            error: null, // Can be set to indicate that the poem failed to load
            buttons: [
                {
                    key: 'helpplay',
                    options: { type: 'is-primary', 'icon-left': 'help', },
                    listeners: { click: this.showHelp, },
                    shouldShow: () => this.mode === 'play',
                },
                {
                    key: 'helptutorial',
                    options: { type: 'is-primary', 'icon-left': 'help', },
                    listeners: { click: this.showHelpTutorial, },
                    shouldShow: () => this.mode === 'tutorial' && this.currentStep?.help
                },
                {
                    key: 'edit',
                    options: { type: 'is-dark', 'icon-left': 'hammer-wrench', },
                    listeners: { click: () => {
                        this.$router.push({ name: 'Edit', params: { poemID: this.poem.id }});
                    } },
                    shouldShow: () => this.mode === 'play' && store.getters.isAdmin && this.poem
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
                },
                {
                    key: 'capture',
                    options: { type: 'is-warning', 'icon-left': 'camera', },
                    listeners: { click: this.capture, },
                    shouldShow: () => this.mode !== 'edit'
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
        async checkLine(lineID, answer) {
            // Construct the input to the server
            const input = { poemID: this.poem.id, lineID, answer }
            let result = (await this.$apollo.mutate({ mutation: SubmitLine, variables: { input } })).data.submitLine;
            // If the user is logged in, then we can assume that data on the server has changed.
            // Set saved so we can show reset button, etc.
            // Otherwise show a reminder that progress isn't being saved...
            if (store.getters.hasIdentity) this.progress.saved = true;
            else Reminders.showMessage('playingasguest');
            return result;
        },

        /**
         * Handles checking submitted line answers in tutorial mode
         */
        async checkTutorialLine(lineID, answer) {
            return checkLine(tutorialPoem.key[lineID], answer);
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
         * If the poem doesn't exist on the server,
         * creates a new poem on the server and initializes its data
         */
        async save() {
            // Serialize poem and send to server
            let variables = { data: JSON.stringify(this.poem) };
            let { ok, id } = (await this.$apollo.mutate({ mutation: CreatePoem, variables })).data.createPoem;
            // If poem was saved successfully, show message and reload view
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.poem.savesuccess'),
                    type: 'is-success'
                });
                this.$router.push({ name: 'Edit', params: { poemID: id }});
            }
            this.$emit('saveSuccess');
        },

        /**
         * If the poem already exists on the server,
         * updates the poem on the server by sending transforms
         */
        async saveChanges() {
            // Update poem on server
            let variables = { id: this.poem.id, transforms: this.transforms.map(JSON.stringify) };
            let { ok }  = (await this.$apollo.mutate({ mutation: UpdatePoem, variables })).data.updatePoem;
            // If changes were accepted successfully, show a nice message
            // and save current poem state
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.poem.savechangessuccess'),
                    type: 'is-success'
                });
                this.makeSnapshot();
            }
            this.$emit('saveChangesSuccess');
        },

        showHelp() {
            this.$buefy.dialog.alert({...this.$translation.get('dialog.poem.help')});
        },

        showHelpTutorial() {
            this.$buefy.dialog.alert({
                ...this.$translation.get('dialog.tutorial.help.' + this.currentStep.help),
            });
        },

        async confirmResetProgress() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.poem.resetprogress'),
                type: 'is-danger',
                hasIcon: true,
                onConfirm: this.resetProgress,
            });
        },

        /**
         * Deletes a player's progress towards the current poem from the server
         */
        async resetProgress() {
            const variables = { input: { poemID: this.poem.id } };
            let { ok } = (await this.$apollo.mutate({ mutation: ResetProgress, variables })).data.resetProgress;
            // If we've successfully reset progress, show a nice message and clear the slots
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.poem.resetsuccess'),
                    type: 'is-danger'
                });
                this.setupProgress();
            }
            this.$emit('resetProgressSuccess');
        },

        async confirmDelete() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.poem.delete'),
                type: 'is-danger',
                hasIcon: true,
                onConfirm: this.delete,
            });
        },

        /**
         * Deletes a saved poem from the server!
         * Only applicable in edit mode
         */
        async delete() {
            const variables = { id: this.poem.id };
            let { ok } = (await this.$apollo.mutate({ mutation: DeletePoem, variables })).data.deletePoem;
            // If we've successfully reset progress, show a nice message and navigate backwards
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.poem.deletesuccess'),
                    type: 'is-danger'
                });
                this.$router.back();
            }
            this.$emit('deleteSuccess');
        },

        /**
         * Converts the gameboard to an image that the user can save
         * This creates a way to show proof of completion and create teaching material
         */
        async capture() {
            this.preparingCapture = true;
            let canvas = await html2canvas(this.$refs.gameboard);
            canvas.toBlob((blob) => {
                this.sounds.capture();
                this.preparingCapture = false;
                this.$emit('captureSuccess');
                saveAs(blob, 'poem-capture.png');
            });
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

        onLineCorrect(line) {
            this.$emit('lineCorrect', line);
            // Update numCorrect
            this.progress.numCorrect += 1;
            if (this.progress.numCorrect === this.poem.lines.length) this.onComplete();
            else this.sounds.correct();
        },

        onComplete() {
            this.$emit('complete');
            // Play fun sound and show dialog if in play mode
            this.sounds.poemComplete();
            if (this.mode === 'play') this.showComplete = true;
        },

        onLineIncorrect(line) {
            this.$emit('lineIncorrect', line);
            this.sounds.incorrect();
        },

        startTutorial() {
            this.tutorialProgress = 0;
            this.currentStep.start({ vm: this, advance: this.advanceTutorial });
        },

        advanceTutorial() {
            this.currentStep.close({ vm: this });
            this.tutorialProgress += 1;
            this.currentStep.start({ vm: this, advance: this.advanceTutorial });
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
            return this.tutorial?.steps[this.tutorialProgress];
        },
        errorMessage() {
            return this.$translation.get('dialog.poem.error.message.' + toTranslationKey(this.error));
        },
        isBusy() {
            return this.preparingCapture;
        },
    },

}
</script>