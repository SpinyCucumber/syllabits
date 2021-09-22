<template>
    <div class="block-picker">
        <block-slot
            v-for="type in this.$constants.BlockTypes.values"
            :key="type.name"
            :holding="type"
            mode="bucket"/>
    </div>
</template>

<script>
import BlockSlot from './BlockSlot'

export default {
    components: { BlockSlot }
}
</script>