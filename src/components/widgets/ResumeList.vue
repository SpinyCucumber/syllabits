<template>
    <connection
        :query="inProgress"
        field="poemsInProgress"
        :component="PoemCard"
        prop="poem">
    </connection>
</template>

<script>
import Connection from '../Connection'
import PoemCard from '../PoemCard'
import { inProgress } from '@/queries'

export default {
    components: { Connection },
    setup() {
        return { inProgress, PoemCard }
    },
}
</script>