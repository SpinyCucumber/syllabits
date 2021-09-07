<template>
    <div>
        <h1>TODO</h1>
        <b-dropdown>
            <template #trigger="{ active }">
                <b-button
                    label="Blocks"
                    type="is-primary"
                    :icon-right="active ? 'menu-up' : 'menu-down'"/>
            </template>
            <b-dropdown-item custom class="syllabits-block-picker-container">
                <block-picker/>
            </b-dropdown-item>
        </b-dropdown>
    </div>
</template>

<script>
import { BlockPicker } from '@/components'

export default {
    name: 'Play',
    components: { BlockPicker }
}
</script>