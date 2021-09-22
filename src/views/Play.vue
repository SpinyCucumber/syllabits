<template>

    <div
        style="display: flex; flex-direction: column; position: relative;
            align-items: stretch; min-height: 0;">

        <b-dropdown
            animation="slide"
            class="block-dropdown"
            style="position: absolute; top: 0em; left: 1em;"

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

        <div
            style="display: flex; flex-direction: column; flex-grow: 1; min-height: 0;
                align-items: stretch center; justify-content: middle; overflow-y: scroll;">
            <div
                class="background"
                style="display: flex; flex-grow: 1; flex-direction: column; align-items: center;">

                <div style="display: flex; flex-direction:column; flex-grow: 1;" class="has-background-white">

                    <!-- TODO Help button -->

                    <div v-if="poem"
                        class="poem"
                        style="display: flex; flex-grow: 1; flex-direction: column; align-items: center; gap: 2em;
                            padding-left: 6em; padding-right: 6em; padding-top: 3em;">

                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="title">{{ poem.name }}</div>
                            <div class="author">{{ poem.author }}</div>
                        </div>
                        
                        <img :src="$assets.getIcon('Divider', 'png')" class="non-interactive"/>
                        
                        <!-- Poem lines -->
                        <div style="display: flex; flex-grow: 1; flex-direction: column; gap: 2em;">
                            <poem-line
                                v-for="line in poem.lines"
                                :key="line.number"
                                :line="line"/>
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
    apollo: {
        poem: {
            query: poemQuery,
            // Reactive query variables
            variables() {
                return { id: this.id }
            },
        }
    }
}
</script>