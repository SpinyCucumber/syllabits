<template>

    <div class="frame">

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

        <div class="inner">
            <div>
                <div>

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
                                :lineProgressProxy.sync="progress.lines[i-1]"/>
                        </div>

                    </div>

                </div>
            </div>
        </div>

    </div>
</template>

<script>
import poemQuery from '@/queries/poem.gql'
import { BlockPicker, PoemLine } from '@/components'

export default {
    name: 'Play',
    components: { BlockPicker, PoemLine },

    props: {
        id: { required: true, type: String },
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
            this.$apollo.query({ query: poemQuery, variables: { id: this.id } })
                .then(result => result.data.poem)
                .then(poem => {
                    this.poem = poem;
                    // TODO Set progress from query
                    this.progress = { lines: [] };
                });
        },
        resetProgress() {
            this.progress = { lines: [] };
        }
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