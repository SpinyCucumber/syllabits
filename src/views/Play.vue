<template>

    <reader>

        <template #static-area>
            <!-- Block picker "drawer" -->
            <div class="block-dropdown">
                <game-dropdown :has-handle="true">
                    <block-picker/>
                </game-dropdown>
            </div>

            <div class="progress-dropdown">
                <game-dropdown v-if="poem" :trigger="progress.numComplete">
                    <game-progress
                        :max-value="poem.totalLines"
                        :value="progress.numComplete"/>
                </game-dropdown>
            </div>

        </template>

        <template #content-area>

            <div class="toolbar">
                <!-- TODO Help button, "cheat" utils -->
            </div>

            <div v-if="poem" class="poem">

                <div class="title-box">
                    <div class="title">{{ poem.name }}</div>
                    <div class="subtitle">{{ poem.author }}</div>
                </div>

                <img :src="$assets.getIcon('Divider')" class="divider"/>

                <!-- Poem lines -->
                <div class="body">
                    <div v-for="(stanza, i) in poem.lines"
                        :key="i"
                        class="stanza">
                        <poem-line
                            v-for="line in stanza"
                            :key="line.number"
                            :line="line"
                            :lineProgressProxy.sync="progress.lines[line.number]"
                            @check="checkLine(line.number, ...arguments)"
                            @correct="onCorrect"
                            @incorrect="onIncorrect"/>
                    </div>
                </div>

            </div>

            <!-- Poem complete dialog -->
            <b-modal v-model="complete">
                <div>
                    Hi!
                </div>
            </b-modal>

        </template>

    </reader>
</template>

<script>
import poemQuery from '@/queries/poem.gql'
import checkLineQuery from '@/queries/checkLine.gql'
import { BlockPicker, PoemLine, Reader, GameProgress, GameDropdown } from '@/components'
import { Constants, AssetService } from '@/services'
import useSound from 'vue-use-sound'

const { BlockTypes } = Constants;

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
        }
    },

    methods: {

        checkLine(lineNum, holding, finish) {
            // Create a code using the block types the line contains.
            // This is for representing the sequence of blocks efficiently.
            const code = BlockTypes.serializeSequence(holding);
            // We have to construct the input
            const input = { poemID: this.poemID, lineNum, answer: code }
            this.$apollo.mutate({ mutation: checkLineQuery, variables: { input } })
                .then(result => result.data.checkLine)
                .then(finish);
        },

        onCorrect() {
            // Increment correct line number
            this.progress.numComplete += 1;
            // Play sound
            this.sounds.correct();
            // If all lines have been completed, trigger poem completion
            if (this.progress.numComplete === this.poem.totalLines) {
                this.progress.complete = true;
            }
        },

        onIncorrect() {
            this.sounds.incorrect();
        },

    },

    computed: {
        // Provide a reference to completed so we can watch it
        complete() {
            return this.progress.complete;
        }
    },

    watch: {
        poemID: {
            handler(newVal) {
                // Perform server query
                this.$apollo.query({ query: poemQuery, variables: { id: newVal } })
                    .then(result => result.data.poem)
                    .then(poem => {
                        this.poem = poem;
                        // TODO Set progress from query
                        this.progress = { lines: [], numComplete: 0, complete: false }
                    });
            },
            immediate: true,
        },
        complete(newVal) {
            if (newVal) {
                // Play fun sound!
                this.sounds.complete();
            }
        },
    }

}
</script>