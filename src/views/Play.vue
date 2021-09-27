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
                        
                        <!-- Manuscript Divider
                        <img :src="$assets.getIcon('Divider', 'png')" class="non-interactive"/>
                        -->

                        <img :src="$assets.getIcon('Divider')" class="divider"/>

                        <!-- Poem lines -->
                        <div class="body">
                            <poem-line
                                v-for="i in poem.lines.length"
                                :key="i"
                                :line="poem.lines[i-1]"
                                :lineState="state.lines[i-1]"/>
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
import { PlayState } from '@/models'

export default {
    name: 'Play',
    components: { BlockPicker, PoemLine },

    props: {
        id: { required: true, type: String },
    },

    data() {
        return {
            state: new PlayState(),
        }
    },

    created() {
        this.state.initializeEmpty();
    },

    // TODO This will be probably be moved into the instantiation logic
    apollo: {
        poem: {
            query: poemQuery,
            // Reactive query variables
            variables() {
                return { id: this.id }
            },
        }
    },

    /**
     * Called when the route changes (including parameters)'
     * This is where we handle instantiation logic.
     * If the user has an identity, we set our progress from the server query
     * If the user has no identity, we simply clear any current progress
     */
    beforeRouteUpdate(to, from, next) {
        // TODO Initialize progress from server query
        // Initialize empty board
        this.state.initializeEmpty();
        next();
    },

}
</script>