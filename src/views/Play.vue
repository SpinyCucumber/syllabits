<template>
    <div class="is-flex is-flex-direction-column">
        <b-dropdown>
            <template #trigger="{ active }">
                <b-button
                    label="Blocks"
                    type="is-primary"
                    :icon-right="active ? 'menu-up' : 'menu-down'"/>
            </template>
            <b-dropdown-item custom>
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