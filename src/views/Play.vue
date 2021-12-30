<template>

    <scene type="is-aligned has-scroll">

        <template #static-area>
            <!-- Block picker "drawer" -->
            <div class="grouping" v-if="mode">
                <div class="block-dropdown">
                    <game-dropdown :has-handle="true">
                        <block-picker/>
                    </game-dropdown>
                </div>

                <div class="progress-dropdown">
                    <game-dropdown :trigger="numCorrect">
                        <game-progress
                            :max-value="poem.lines.length"
                            :value="numCorrect"
                            type="is-rounded"/>
                    </game-dropdown>
                </div>
            </div>

        </template>

        <template #content-area>

            <transition name="fade" mode="out-in">
                <div :class="classes" :key="sessionID">
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
                    
                    <div v-if="poem" class="poem">

                        <div class="title-box">
                            <editable v-model="poem.title"
                                tag="h1"
                                custom-class="title"
                                label-key="title"
                                :input-options="{size: 'is-large', 'custom-class': 'has-text-centered'}"
                                v-slot="{value}">
                                {{ value }}
                            </editable>
                            <editable v-model="poem.author"
                                custom-class="subtitle"
                                label-key="author"
                                :input-options="{'custom-class': 'has-text-centered'}"
                                v-slot="{value}">
                                {{ value }}
                            </editable>
                        </div>

                        <img v-if="mode === 'play'" :src="$assets.getIcon('Divider')" class="divider"/>

                        <!-- Poem lines -->
                        <div class="body">
                            <poem-line
                                v-for="line in poem.lines"
                                :key="line.number"
                                v-bind="lineBindings(line)"
                                @correct="onCorrect"
                                @incorrect="onIncorrect"/>
                        </div>

                    </div>
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

    </scene>
</template>

<script>
import { PlayPoem, EditPoem, SubmitLine, ResetProgress } from '@/queries'
import { BlockPicker, PoemLine, Scene, Editable, GameProgress, GameDropdown } from '@/components'
import { Constants, AssetService, ReminderService } from '@/services'
import { TrackChanges } from '@/mixins'
import store from '@/store'
import clone from 'just-clone'
import useSound from 'vue-use-sound'
import Vue from 'vue'

const { LineState } = Constants;

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
            if (this.$store.getters.hasIdentity) {
                buttons = [...buttons,
                    <b-button type="is-primary"
                        onClick={this.dashboard}
                        label={this.$translation.get('button.dashboard')}/>
                ];
            }
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

    name: 'Play',
    components: { BlockPicker, PoemLine, Scene, Editable, GameProgress, GameDropdown, PoemComplete },

    props: {
        mode: { default: 'play' }, // Valid values are 'play' or 'edit'
        location: { type: String }, // Used for play mode. Determines play "context"
        poemID: { type: String }, // Used for edit mode
    },

    mixins: [
        // In edit mode, we track the changes made to the poem by comparing to an original copy
        TrackChanges({
            prop: 'poem',
            original: 'original',
            excludeFields: ['id', 'progress', '__typename', 'location']
        }),
    ],

    setup() {
        // Load sounds
        const [ correct ] = useSound(AssetService.getSound('Correct'));
        const [ incorrect ] = useSound(AssetService.getSound('Incorrect'));
        const [ complete ] = useSound(AssetService.getSound('Complete'));
        return { sounds: { correct, incorrect, complete } };
    },

    data() {
        return {
            poem: null, // Loaded poem. Contains line text, numbers, title, etc.
            original: null, // Used it edit mode to track changes
            progress: null, // Used to track player answers in play mode
            numCorrect: 0,
            showComplete: false, // Whether the 'poem complete' dialog is being shown
            hasWork: false,
            sessionID: null,
            buttons: [
                {
                    key: 'help',
                    options: { type: 'is-primary', 'icon-left': 'help', },
                    listeners: { click: this.showHelp, },
                    shouldShow: () => this.mode === 'play'
                },
                {
                    key: 'edit',
                    options: { type: 'is-dark', 'icon-left': 'hammer-wrench', },
                    listeners: { click: () => {
                        this.$router.push({ name: 'Edit', params: { poemID: this.poem.id }});
                    } },
                    shouldShow: () => this.mode === 'play'
                },
                {
                    key: 'play',
                    options: { type: 'is-dark', 'icon-left': 'controller-classic', },
                    listeners: { click: () => {
                        this.$router.push({ name: 'Play', params: { location: this.poem.location }});
                    } },
                    shouldShow: () => this.mode === 'edit'
                },
                {
                    key: 'reset',
                    options: { type: 'is-danger', 'icon-left': 'delete', },
                    listeners: { click: this.confirmResetProgress, },
                    shouldShow: () => this.hasWork && this.mode === 'play',
                },
            ],
        }
    },

    methods: {

        /**
         * Properties to be bound to each poem line
         */
        lineBindings(line) {
            let bindings = ({
                line,
                mode: this.mode,
            });
            // Some bindings are only applicable in play mode
            if (this.mode === 'play') bindings = {
                ...bindings,
                checkHandler: (holding) => this.checkLine(line.number, holding),
                progress: this.progress[line.number],
            }
            return bindings;
        },

        checkLine(lineNum, answer) {
            // Construct the input to the server
            const input = { poemID: this.poem.id, lineNum, answer }
            return this.$apollo.mutate({ mutation: SubmitLine, variables: { input } })
                .then(result => result.data.submitLine)
                .then(result => {
                    // If the user is logged in, then we can assume that data on the server has changed.
                    // Set hasWork so we can show reset button, etc.
                    if (store.getters.hasIdentity) this.hasWork = true;
                    return result;
                });
        },
        
        /**
         * Sets up data structures used to track player progress
         * Should only be called in play mode, and poem should be set
         */
        setupProgress() {
            this.hasWork = false;
            this.progress = [];
            this.numCorrect = 0;
            for (let i = 0; i < this.poem.lines.length; i++) {
                const { numFeet } = this.poem.lines[i];
                Vue.set(this.progress, i, {
                    state: LineState.Unchecked,
                    holding: new Array(numFeet).fill(null),
                    attempts: 0,
                })
            }
        },

        showHelp() {
            this.$buefy.dialog.alert(this.$translation.get('dialog.help'));
        },

        confirmResetProgress() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.resetprogress'),
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
                            message: this.$translation.get('message.resetsuccess'),
                            type: 'is-danger'
                        });
                        this.setupProgress();
                    }
                })
        },

        onCorrect() {
            // Update numCorrect
            this.numCorrect += 1;
            if (this.numCorrect === this.poem.lines.length) {
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
            return ['play-view', 'is-mode-' + this.mode];
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
    },

    watch: {
        $props: {
            handler(props) {

                // Start new session
                this.sessionID = btoa(Math.random()).substring(0,12);
                const { mode, location, poemID } = props;

                if (mode === 'play') {
                    // Perform server query
                    this.$apollo.mutate({mutation: PlayPoem, variables: { location }})
                        .then(result => result.data.playPoem)
                        .then(({poem, next, previous}) => {
                            // Set poem and initialize progress data
                            this.poem = poem;
                            this.setupProgress();
                            // Update progress from server if applicable
                            const { progress } = poem;
                            if (progress) {
                                this.hasWork = true;
                                this.numCorrect = progress.numCorrect;
                                for (const line of progress.lines) {
                                    let localLine = this.progress[line.number];
                                    // Update holding and state
                                    localLine.holding = line.answer;
                                    localLine.state = line.correct ? LineState.Correct : LineState.Incorrect;
                                }
                            }
                            // Update navigation links
                            let links = [];
                            if (next) links.push({key: 'next', to: {name: 'Play', params: {location: next}}})
                            if (previous) links.push({key: 'previous', to: {name: 'Play', params: {location: previous}}})
                            this.$emit('update:additionalLinks', links);
                        });
                }

                else if (mode === 'edit') {
                    // Query full poem (including keys) from server
                    this.$apollo.query({ query: EditPoem, variables: { poemID }, fetchPolicy: 'network-only' })
                        .then(result => result.data.node)
                        .then(poem => {
                            // Load the queried poem
                            // We also keep a copy of the original poem to track changes
                            this.original = poem;
                            this.poem = clone(poem);
                        });
                }

            },

            deep: true,
            immediate: true,

        },
    },

    beforeRouteEnter(to, from, next) {
        // If user is not logged in (playing as guest), we send them a polite reminder
        if (!store.getters.hasIdentity) ReminderService.show('playingasguest');
        next();
    },

    // Make sure to clean up our navigation links like a good boy
    // Could abstract this with a mixin if end up using this pattern more
    beforeRouteLeave(to, from, next) {
        this.$emit('update:additionalLinks', []);
        next();
    },

}
</script>