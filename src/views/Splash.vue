<template>
    <reader class="splash" :card="true">
        <template #content-area>
            <div class="title-box">
                <h1 class="branding">SyllaBits</h1>
                <img :src="$assets.getIcon('Divider')" class="divider"/>
                <poem-line
                    v-for="(line, i) in demoPoem"
                    :key="i"
                    :line="line"
                    :lineProgressProxy="demoProgress[i]"/>
            </div>
        </template>
        <template #background-area>
            <carousel :imageSources="images"/>
        </template>
    </reader>
</template>

<script>
import { Reader, Carousel, PoemLine } from '@/components'
import { AssetService } from '@/services'

export default {
    components: { Reader, Carousel, PoemLine },
    data() {
        return {
            images: ['Paper1', 'Paper2', 'Paper3', 'Paper4'].map(AssetService.getTexture),
            demoPoem: [
                { text: "With building blocks to practice and refine" },
                { text: "your scansion skills will grow with every line" },
            ],
            demoProgress: []
        }
    }
}
</script>