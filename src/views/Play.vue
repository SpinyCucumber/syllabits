<template>

    <reader ref="reader">

        <template #static-area>
            <!-- Block picker "drawer" -->
            <b-dropdown
                animation="slide"
                class="block-dropdown"

                :mobile-modal="false"
                :can-close="false"
                :close-on-click="false">
                <template #trigger>
                    <b-button class="hanging">
                        <img :src="$assets.getIcon('Blocks')"
                            width="60"/>
                    </b-button>
                </template>
                <b-dropdown-item custom>
                    <block-picker/>
                </b-dropdown-item>
            </b-dropdown>

            <game-progress v-if="poem"
                :max-value="poem.lines.length"
                :value="progress.numComplete"
                ref="progress"/>

        </template>

        <template #content-area>

            <!-- TODO Help button -->

            <div v-if="poem" class="poem" ref="content">

                <div class="title-box">
                    <div class="title">{{ poem.name }}</div>
                    <div class="author">{{ poem.author }}</div>
                </div>

                <img :src="$assets.getIcon('Divider')" class="divider"/>

                <!-- Poem lines -->
                <div class="body">
                    <poem-line
                        v-for="i in poem.lines.length"
                        :key="i"
                        :line="poem.lines[i-1]"
                        :lineProgressProxy.sync="progress.lines[i-1]"
                        @check="checkLine(i-1, ...arguments)"
                        @correct="onCorrect"
                        @incorrect="onIncorrect"/>
                </div>

            </div>

        </template>

    </reader>
</template>

<script>
import poemQuery from '@/queries/poem.gql'
import checkLineQuery from '@/queries/checkLine.gql'
import { BlockPicker, PoemLine, Reader, GameProgress } from '@/components'
import { Constants } from '@/services'

const { BlockTypes } = Constants;

export default {

    name: 'Play',
    components: { BlockPicker, PoemLine, Reader, GameProgress },

    props: {
        poemID: { required: true, type: String },
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

        resizeProgressBar() {
            // Sync width of progress bar and content container
            // const progressEl = this.$refs.progress;
            const contentEl = this.$refs.content;
            const readerEl = this.$refs.reader;

            const contentRect = contentEl.getBoundingClientRect();
            const readerRect = readerEl.getBoundingClientRect();

            const top = contentRect.top - readerRect.top;
            const left = contentRect.left - readerRect.left;
            // DEBUG
            console.log({ top, left });
        
        },

        onCorrect() {
            // Increment correct line number
            this.progress.numComplete += 1;
            // TODO Play sound
        },

        onIncorrect() {
            // TODO
        },

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
                        this.progress = { lines: [], numComplete: 0 }
                        this.resizeProgressBar();
                    });
            },
            immediate: true,
        }
    }

}
</script>