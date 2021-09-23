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
                        
                        <img :src="$assets.getIcon('Divider', 'png')" class="non-interactive"/>
                        
                        <!-- Poem lines -->
                        <div class="body">
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