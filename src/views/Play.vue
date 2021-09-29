<template>

    <reader>

        <template #static-area>
            <b-dropdown
                animation="slide"
                class="block-dropdown"

                :mobile-modal="false"
                :can-close="false"
                :close-on-click="false">
                <template #trigger>
                    <b-button>
                        <img :src="$assets.getIcon('Blocks')"
                            width="60"/>
                    </b-button>
                </template>
                <b-dropdown-item custom>
                    <block-picker/>
                </b-dropdown-item>
            </b-dropdown>
        </template>

        <template #content-area>

            <!-- TODO Help button -->

            <div v-if="poem" class="poem">

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
                        @check="checkLine(i-1, ...arguments)"/>
                </div>

            </div>

        </template>

    </reader>
</template>

<script>
import poemQuery from '@/queries/poem.gql'
import checkLineQuery from '@/queries/checkLine.gql'
import { BlockPicker, PoemLine, Reader } from '@/components'
import { Constants } from '@/services'

const { BlockTypes } = Constants;

export default {

    name: 'Play',
    components: { BlockPicker, PoemLine, Reader },

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

        // Called when the component is first created and whenever the route changes.
        // Queries the server for poem data.
        initialize() {
            // Perform server query
            this.$apollo.query({ query: poemQuery, variables: { id: this.poemID } })
                .then(result => result.data.poem)
                .then(poem => {
                    this.poem = poem;
                    // TODO Set progress from query
                    this.progress = { lines: [] };
                });
        },

        resetProgress() {
            this.progress = { lines: [] };
        },

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

    },

    created() {
        this.initialize();
    },

    /**
     * Called when the route changes (including parameters)'
     * This is where we handle instantiation logic.
     * If the user has an identity, we set our progress from the server query
     * If the user has no identity, we simply clear any current progress
     */
    beforeRouteUpdate(to, from, next) {
        this.initialize();
        next();
    },

}
</script>