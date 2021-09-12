<template>
    <div class="is-flex is-flex-direction-column">

        <div class="is-flex">

            <b-dropdown
                animation="slide"
                class="block-dropdown ml-2"
                :can-close="false"
                :close-on-click="false">
                <template #trigger>
                    <b-button>
                        <img src="blocks.svg"
                            width="60"/>
                    </b-button>
                </template>
                <b-dropdown-item custom>
                    <block-picker/>
                </b-dropdown-item>
            </b-dropdown>

            <block-slot/>

        </div>

    </div>
</template>

<script>
import { BlockPicker, BlockSlot } from '@/components'

export default {
    name: 'Play',
    components: { BlockPicker, BlockSlot }
}
</script>