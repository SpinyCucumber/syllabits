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
            class="has-background-white"
            style="display: flex; flex-grow: 1; flex-direction: column; align-items: center; padding: 2em;">
            <h1>{{ poem.name }}</h1>
            <div class="subtitle">{{ poem.author }}</div>
            <block-slot/>
        </div>

    </div>
</template>

<script>
import poemQuery from '@/queries/poem.gql'
import { BlockPicker, BlockSlot } from '@/components'

export default {
    name: 'Play',
    components: { BlockPicker, BlockSlot },
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