<template>
    <reader class="splash" :card="true">
        <template #content-area>
            <h1 class="branding">Syllabits</h1>
        </template>
        <template #background-area>
            <carousel :imageSources="images"/>
        </template>
    </reader>
</template>

<script>
import { Reader, Carousel } from '@/components'
import { AssetService } from '@/services'

export default {
    components: { Reader, Carousel },
    data() {
        return {
            images: ['Paper1', 'Paper2', 'Paper3', 'Paper4'].map(AssetService.getTexture)
        }
    }
}
</script>