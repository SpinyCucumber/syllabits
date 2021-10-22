<template>
    <reader class="splash" :card="true">
        <template #content-area>
            <div>
                <div class="title-box">
                    <h1 class="branding">SyllaBits</h1>
                    <img :src="$assets.getIcon('Divider')" class="divider"/>
                </div>
                <div class="demo-poem">
                    <poem-line
                        v-for="(line, i) in demoPoem"
                        :has-number="false"
                        :key="i"
                        :line="line"
                        :lineProgressProxy="demoProgress[i]"/>
                </div>
            </div>
            <div class="portal">
                <img :src="$assets.getTexture('Logo')" class="logo"/>
                <div class="button-area">
                    
                </div>
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
                { text: "\"With building blocks to practice and refine" },
                { text: "your scansion skills will grow with every line\"" },
            ],
            demoProgress: []
        }
    }
}
</script>