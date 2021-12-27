<template>

    <scene type="is-aligned has-scroll">

        <template #static-area>
            <!-- Block picker "drawer" -->
            <div class="grouping" v-if="ready">
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

            <div :class="classes">
                <div class="toolbar">
                    <!-- "Cheat" utils -->
                    <transition name="fade">
                        <div v-if="showCheats && mode === 'play'" class="toolbar-start">
                            <b-button
                                :label="$translation.get('button.completeall')"
                                @click="completeAll"/>
                            <b-button
                                :label="$translation.get('button.completeone')"
                                @click="completeOne"/>
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
                
                <transition name="fade" mode="out-in">
                <div class="poem" v-if="ready" :key="poem.id">

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

                    <img :src="$assets.getIcon('Divider')" class="divider"/>

                    <!-- Poem lines -->
                    <div class="body">
                        <poem-line
                            v-for="line in poem.lines"
                            v-bind="{mode, line}"
                            :key="line.number"
                            :progress="progress[line.number]"
                            :checkHandler="(holding) => checkLine(line.number, holding)"
                            @correct="onCorrect"
                            @incorrect="onIncorrect"/>
                    </div>

                </div>
                </transition>

                <!-- Poem complete dialog -->
                <b-modal
                    v-model="showComplete"
                    has-modal-card>
                    <div class="modal-simple">
                        <header class="modal-simple-head">
                            <p class="modal-simple-title">{{ $translation.get("play.complete") }}</p>
                        </header>
                        <footer class="modal-simple-foot">
                            <b-button tag="router-link"
                                v-if="$store.getters.hasIdentity"
                                type="is-primary"
                                :to="{name: 'Dashboard'}"
                                :label="$translation.get('button.dashboard')"/>
                            <b-button tag="router-link"
                                type="is-primary"
                                :to="{name: 'RandomPoem'}"
                                :label="$translation.get('button.anotherpoem')"/>
                        </footer>
                    </div>
                </b-modal>
                </div>
        </template>

    </scene>
</template>

<script>
import { PlayPoem, EditPoem, SubmitLine, ResetProgress } from '@/queries'
import { BlockPicker, PoemLine, Scene, Editable, GameProgress, GameDropdown } from '@/components'
import { Constants, AssetService, ReminderService } from '@/services'
import store from '@/store'
import useSound from 'vue-use-sound'
import Vue from 'vue'

const { BlockTypes, LineState } = Constants;

export default {

    name: 'Play',
    components: { BlockPicker, PoemLine, Scene, Editable, GameProgress, GameDropdown },

    props: {
        mode: { default: 'play' }, // Valid values are 'play' or 'edit'
        location: { type: String }, // Used for play mode. Determined play "context"
        poemID: { type: String }, // Used for edit mode
    },

    setup() {
        // Load sounds
        const [ correct ] = useSound(AssetService.getSound('Correct'));
        const [ incorrect ] = useSound(AssetService.getSound('Incorrect'));
        const [ complete ] = useSound(AssetService.getSound('Complete'));
        return { sounds: { correct, incorrect, complete } };
    },

    data() {
        return {
            poem: null,
            original: null, // Used it edit mode to track changes
            progress: null, // Used to track player answers in play mode
            numCorrect: 0,
            showComplete: false,
            hasWork: false,
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
                    listeners: { click: this.confirmReset, },
                    shouldShow: () => this.hasWork && this.mode === 'play',
                },
            ],
        }
    },

    methods: {

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
        
        initialize(numLines) {
            this.hasWork = false;
            this.progress = [];
            this.numCorrect = 0;
            for (let i = 0; i < numLines; i++) {
                Vue.set(this.progress, i, {
                    state: LineState.Unchecked,
                    holding: new Array(5).fill(null),
                    attempts: 0,
                })
            }
        },

        showHelp() {
            this.$buefy.dialog.alert(this.$translation.get('dialog.help'));
        },

        confirmReset() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.resetprogress'),
                type: 'is-danger',
                hasIcon: true,
                onConfirm: this.reset,
            })
        },

        reset() {
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
                        this.initialize(this.poem.lines.length);
                    }
                })
        },

        onCorrect() {
            // Update numCorrect
            this.numCorrect += 1;
            if (!this.complete) {
                // Play sound
                this.sounds.correct();
            }
        },

        onIncorrect() {
            this.sounds.incorrect();
        },

        completeAll() {
            this.numCorrect = this.poem.lines.length;
        },

        completeOne() {
            this.onCorrect();
        },

    },

    computed: {
        classes() {
            return ['play-view', 'is-mode-' + this.mode];
        },
        ready() {
            return Boolean(this.poem);
        },
        complete() {
            return this.ready && (this.numCorrect === this.poem.lines.length);
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

                const { mode, location, poemID } = props;

                if (mode === 'play') {
                    // Perform server query
                    this.$apollo.mutate({mutation: PlayPoem, variables: { location }})
                        .then(result => result.data.playPoem)
                        .then(({poem, next, previous}) => {
                            this.initialize(poem.lines.length);
                            // Update progress from server if applicable
                            const { progress } = poem;
                            if (progress) {
                                this.hasWork = true;
                                this.numCorrect = progress.numCorrect;
                                for (const line of progress.lines) {
                                    let localLine = this.progress[line.number];
                                    // Update holding and state
                                    localLine.holding = Array.from(line.answer).map(code => BlockTypes.forCode(code));
                                    localLine.state = line.correct ? LineState.Correct : LineState.Incorrect;
                                }
                            }
                            // Update navigation links
                            let links = [];
                            if (next) links.push({key: 'next', to: {name: 'Play', params: {location: next}}})
                            if (previous) links.push({key: 'previous', to: {name: 'Play', params: {location: previous}}})
                            this.$emit('update:additionalLinks', links);
                            // Finally set poem
                            this.poem = poem;
                        });
                }

                else if (mode === 'edit') {
                    // Query full poem (including keys) from server
                    this.$apollo.query({ query: EditPoem, variables: { poemID }})
                        .then(result => result.data.node)
                        .then(poem => {
                            // Load the queried poem
                            // We also keep a copy of the original poem to track changes
                            this.poem = poem;
                            this.original = poem;
                        });
                }

            },
            deep: true,
            immediate: true,
        },
        complete(newVal) {
            if (newVal) {
                // Play fun sound!
                this.sounds.complete();
            }
            this.showComplete = newVal;
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