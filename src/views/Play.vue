<template>
    <!-- TODO Use SASS for background color, etc. -->
    <div
        class="has-background-primary"
        style="display: flex; flex-direction: column; position: relative; align-items: center; justify-content: middle;">

        <b-dropdown
            animation="slide"
            class="block-dropdown"
            style="position: absolute; top: 0px; left: 1em;"

            :can-close="false"
            :close-on-click="false">
            <template #trigger>
                <b-button>
                    <img src="@/assets/blocks.svg"
                        width="60"/>
                </b-button>
            </template>
            <b-dropdown-item custom>
                <block-picker/>
            </b-dropdown-item>
        </b-dropdown>

        <div v-if="poem"
            class="has-background-white poem"
            style="display: flex; flex-grow: 1; flex-direction: column; align-items: center; gap: 4em;
                padding: 2em 6em 2em 6em;">

            <div style="display: flex; flex-direction: column; align-items: center;">
                <div class="title">{{ poem.name }}</div>
                <div class="author">{{ poem.author }}</div>
            </div>
            
            <!-- Poem lines -->
            <div style="display: flex; flex-grow: 1; flex-direction: column; gap: 2em;">
                 <div
                    v-for="line in poem.lines"
                    :key="line.number"
                    style="display: flex; align-items: center; gap: 4em;">
                    <!-- Line number -->
                    <div class="line-number">{{ line.number }}</div>
                    <!-- Line component -->
                    <poem-line :line="line"/>
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