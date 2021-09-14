<template>
    <div style="display: flex; flex-direction: column">
        <!-- Block slots -->
        <div style="display: flex; justify-content: space-around;">
            <block-slot v-for="n in 5" :key="n"/>
        </div>
        <!-- Line text -->
        <div class="content">{{ line.text }}</div>
    </div>
</template>

<script>
import BlockSlot from './BlockSlot'

export default {
    name: 'PoemLine',
    components: { BlockSlot },
    props: { 
        line: { required: true },
    }
}
</script>