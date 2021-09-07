<template>
    <div>
        <h1>TODO</h1>
        <block-picker/>
    </div>
</template>

<script>
import { BlockPicker } from '@/components'

export default {
    name: 'Dashboard',
    components: { BlockPicker }
}
</script>