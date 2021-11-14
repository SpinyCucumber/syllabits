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
                    <!-- TODO Help button -->
                    <div class="toolbar-end">
                        <b-button
                            v-for="button in buttons"
                            :key="button.key"
                            :type="button.type"
                            :icon-left="button.icon"
                            @click="button.action"/>
                    </div>
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
                                :lineProgress="progress.lines[line.number]"
                                :checkHandler="(holding) => checkLine(line.number, holding)"
                                @correct="onCorrect"
                                @incorrect="onIncorrect"/>
                    </div>

                </div>
                </transition>

                <!-- Poem complete dialog -->
                <b-modal v-model="showComplete">
                    <div class="dialog">
                        <div class="title">{{ $translation.get("play.complete") }}</div>
                        <!-- TODO Replace this with actual art -->
                        <img class="divider" :src="$assets.getIcon('Divider')"/>
                        <div class="dialog-footer">
                            <b-button
                                v-for="button in completeButtons"
                                :key="button.key"
                                tag="router-link"
                                :to="button.to"
                                type="is-primary"
                                :label="$translation.get('button.' + button.key)"/>
                        </div>
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
            progress: { lines: [] },
            showComplete: false,
            buttons: [
                { key: 'help', type: 'is-info', icon: 'help', action: this.showHelp },
                { key: 'reset', type: 'is-danger', icon: 'delete', action: this.confirmReset },
            ],
            cheatButtons: [
                { key: 'completeall', action: this.completeAll },
                { key: 'completenext', action: this.completeNext },
            ],
            completeButtons: [
                { key: 'dashboard', to: { name: 'Dashboard' } },
                { key: 'randompoem', to: { name: 'RandomPoem' } },
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
                .then(result => result.data.submitLine);
        },
        
        initializeLines(numLines) {
            for (let i = 0; i < numLines; i++) {
                Vue.set(this.progress.lines, i, {
                    state: LineState.Unchecked,
                    holding: new Array(5).fill(null),
                    attempts: 0,
                })
            }
        },

        showHelp() {
            // TODO
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
                        this.initializeLines(this.poem.lines.length);
                    }
                })
        },

        onCorrect() {
            if (!this.complete) {
                // Play sound
                this.sounds.correct();
            }
        },

        onIncorrect() {
            this.sounds.incorrect();
        },

        completeAll() {
            // Complete all lines
            this.progress.lines.forEach(line => {
                line.state = LineState.Correct;
            })
        },

        completeNext() {
            // Find first line that is not correct and complete it
            const line = this.progress.lines.find(line => line.state !== LineState.Correct);
            if (line) line.state = LineState.Correct;
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
        numCorrect() {
            if (!this.ready) return 0;
            let result = 0;
            this.progress?.lines.forEach(line => {
                if (line.state === LineState.Correct) result += 1;
            });
            return result;
        },
        showCheats() {
            return process.env.VUE_APP_SYLLABITS_CHEATS;
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
                        this.initializeLines(poem.lines.length);
                        // Update progress from server is applicable
                        const { progress } = poem;
                        if (progress) {
                            for (const line of progress.lines) {
                                let localLineProgress = this.progress.lines[line.number];
                                // Update holding and state
                                localLineProgress.holding = this.$constants.BlockTypes.parseSequence(line.answer);
                                localLineProgress.state = line.correct ? LineState.Correct : LineState.Incorrect;
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