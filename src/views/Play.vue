<template>

    <reader class="play">

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
                            :value="numCorrect"/>
                    </game-dropdown>
                </div>
            </div>

        </template>

        <template #content-area>

            <div class="toolbar">
                <!-- TODO Help button -->
                <!-- "Cheat" utils -->
                <div class="right">
                    <transition name="fade" mode="out-in">
                    <div v-if="$config.enableCheats" class="grouping">
                        <b-button
                            v-for="button in cheatButtons"
                            :key="button.key"
                            type="is-warning" size="is-small"
                            :label="$translation.get('button.' + button.key)"
                            @click="button.action"
                        />
                    </div>
                    </transition>
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
                            :lineProgressProxy="progress.lines[line.number]"
                            :checkHandler="(holding) => checkLine(line.number, holding)"
                            :insertLineProgress="() => insertLineProgress(line.number)"
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

        </template>

    </reader>
</template>

<script>
import { poem as poemQuery, submitLine as submitLineQuery } from '@/queries'
import { BlockPicker, PoemLine, Reader, GameProgress, GameDropdown } from '@/components'
import { Constants, AssetService } from '@/services'
import useSound from 'vue-use-sound'
import Vue from 'vue'

const { BlockTypes, LineState } = Constants;

export default {

    name: 'Play',
    components: { BlockPicker, PoemLine, Reader, GameProgress, GameDropdown },

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
            progress: null,
            showComplete: false,
            cheatButtons: [
                { key: 'completeall', action: this.completeAll },
                { key: 'completenext', action: this.completeNext },
                { key: 'reset', action: this.reset },
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
                .then(result => result.data.submitLine.feedback);
        },

        insertLineProgress(number) {
            const line = this.initLineProgress();
            Vue.set(this.progress, number, line);
            return line;
        },

        initLineProgress() {
            return {
                state: LineState.Unchecked,
                holding: new Array(5).fill(null),
                attempts: 0,
            };
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

        nextPoem() {
            // Navigate to the next poem
            this.$router.push({ name: 'Play', params: { poemID: this.poem.next.id } });
        },

        completeNext() {
            // Find first line that is not correct and complete it
            const line = this.progress.lines.find(line => line.state !== LineState.Correct);
            if (line) line.state = LineState.Correct;
        },

        reset() {
            // Reset all progress
            this.progress = { lines: [] }
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
    },

    watch: {
        poemID: {
            handler(newVal) {
                // Perform server query
                // If there is a user logged in, make sure to query the progress as well
                this.$apollo.query({ query: poemQuery, variables: { id: newVal }, fetchPolicy: 'network-only'})
                    .then(result => result.data.poem)
                    .then(poem => {
                        this.poem = poem;
                        this.reset();
                        // TODO Set progress from query
                        // TEST
                        console.log(poem.progress);
                        // Update navigation links
                        let links = [];
                        if (this.poem.next) links.push({
                            key: 'next',
                            to: { name: 'Play', params: { poemID: this.poem.next.id }}
                        });
                        if (this.poem.prev) links.push({
                            key: 'prev',
                            to: { name: 'Play', params: { poemID: this.poem.prev.id }}
                        });
                        this.$emit('update:additionalLinks', links);
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
    }

}
</script>