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

            <div class="play">
                <div class="toolbar">
                    <!-- "Cheat" utils -->
                    <div class="toolbar-start">
                        <div v-if="showCheats" class="grouping">
                            <b-button
                                v-for="button in cheatButtons"
                                :key="button.key"
                                type="is-info"
                                :label="$translation.get('button.' + button.key)"
                                @click="button.action"
                            />
                        </div>
                    </div>
                    <transition-group name="list" tag="div" class="toolbar-end">
                        <b-button
                            v-for="button in displayButtons"
                            :key="button.key"
                            :type="button.type"
                            :icon-left="button.icon"
                            @click="button.action"/>
                    </transition-group>
                </div>
                
                <transition name="fade" mode="out-in">
                <div class="poem" v-if="ready" :key="poemID">

                    <div class="title-box">
                        <h1 class="title">{{ poem.title }}</h1>
                        <div class="subtitle">{{ poem.author }}</div>
                    </div>

                    <img :src="$assets.getIcon('Divider')" class="divider"/>

                    <!-- Poem lines -->
                    <div class="body">
                            <poem-line
                                v-for="line in poem.lines"
                                :key="line.number"
                                :line="line"
                                :lineProgress="lines[line.number]"
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
                            <b-button
                                v-for="button in completionButtons"
                                :key="button.key"
                                tag="router-link"
                                :to="button.to"
                                type="is-primary"
                                :label="$translation.get('button.' + button.key)"/>
                        </footer>
                    </div>
                </b-modal>
                </div>
        </template>

    </scene>
</template>

<script>
import { poem as poemQuery, submitLine as submitLineQuery, resetProgress as resetProgressQuery } from '@/queries'
import { BlockPicker, PoemLine, Scene, GameProgress, GameDropdown } from '@/components'
import { Constants, AssetService } from '@/services'
import useSound from 'vue-use-sound'
import Vue from 'vue'

const { BlockTypes, LineState } = Constants;

export default {

    name: 'Play',
    components: { BlockPicker, PoemLine, Scene, GameProgress, GameDropdown },

    props: {
        poemID: { required: true, type: String },
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
            lines: null,
            numCorrect: 0,
            showComplete: false,
            hasWork: false,
            buttons: [
                { key: 'help', type: 'is-info', icon: 'help', action: this.showHelp, shouldShow: () => true },
                {
                    key: 'reset',
                    type: 'is-danger',
                    icon: 'delete',
                    action: this.confirmReset,
                    shouldShow: () => this.hasWork,
                },
            ],
            cheatButtons: [
                { key: 'completeall', action: this.completeAll },
                { key: 'completeone', action: this.completeOne },
            ],
            completionButtons: [
                { key: 'dashboard', to: { name: 'Dashboard' } },
                { key: 'anotherpoem', to: { name: 'RandomPoem' } },
            ]
        }
    },

    methods: {

        checkLine(lineNum, holding) {
            // Create a code using the block types the line contains.
            // This is for representing the sequence of blocks efficiently.
            const code = BlockTypes.serializeSequence(holding);
            // We have to construct the input to the server
            const input = { poemID: this.poemID, lineNum, answer: code }
            return this.$apollo.mutate({ mutation: submitLineQuery, variables: { input } })
                .then(result => result.data.submitLine)
                .then(result => {
                    // If the user is logged in, then we can assume that data on the server has changed.
                    // Set hasWork so we can show reset button, etc.
                    if (this.$identity.hasIdentity()) this.hasWork = true;
                    return result;
                });
        },
        
        initialize(numLines) {
            this.hasWork = false;
            this.lines = [];
            this.numCorrect = 0;
            for (let i = 0; i < numLines; i++) {
                Vue.set(this.lines, i, {
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
            const input = { poemID: this.poemID };
            this.$apollo.mutate({ mutation: resetProgressQuery, variables: { input } })
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
        ready() {
            return Boolean(this.poem);
        },
        complete() {
            if (!this.ready) return false;
            return this.numCorrect === this.poem.lines.length;
        },
        showCheats() {
            return process.env.VUE_APP_SYLLABITS_CHEATS;
        },
        displayButtons() {
            return this.buttons.filter(button => button.shouldShow())
        },
    },

    watch: {
        poemID: {
            handler(newVal) {
                // Perform server query
                // If there is a user logged in, make sure to query the progress as well
                this.$apollo.query({ query: poemQuery, variables: { id: newVal }, fetchPolicy: 'network-only'})
                    .then(result => result.data.poem)
                    .then(poem => {
                        this.initialize(poem.lines.length);
                        // Update progress from server if applicable
                        const { progress } = poem;
                        if (progress) {
                            this.hasWork = true;
                            this.numCorrect = progress.numCorrect;
                            for (const line of progress.lines) {
                                let localLine = this.lines[line.number];
                                // Update holding and state
                                localLine.holding = this.$constants.BlockTypes.parseSequence(line.answer);
                                localLine.state = line.correct ? LineState.Correct : LineState.Incorrect;
                            }
                        }
                        // Update navigation links
                        let links = [];
                        if (poem.prev) links.push({
                            key: 'prev',
                            to: { name: 'Play', params: { poemID: poem.prev.id }}
                        });
                        if (poem.next) links.push({
                            key: 'next',
                            to: { name: 'Play', params: { poemID: poem.next.id }}
                        });
                        this.$emit('update:additionalLinks', links);
                        // Finally set poem
                        this.poem = poem;
                    });
            },
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

    // Make sure to clean up our navigation links like a good boy
    // Could abstract this with a mixin if end up using this pattern more
    beforeRouteLeave(to, from, next) {
        this.$emit('update:additionalLinks', []);
        next();
    },

}
</script>