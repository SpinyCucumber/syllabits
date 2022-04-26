<template>
    <div class="block-picker">
        <block-slot
            ref="buckets"
            v-for="type in this.$constants.BlockType.values"
            :key="type.name"
            :holding="type"
            :mode="$constants.SlotMode.BUCKET"/>
    </div>
</template>

<script>
import BlockSlot from './BlockSlot'

export default {
    components: { BlockSlot }
}
</script>