<template>
    <reader class="splash" :card="true">
        <template #content-area>
            <div class="page">
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
            <img :src="$assets.getIcon('Column')" class="divider"/>
            <div class="page portal">
                <img :src="$assets.getTexture('Logo')" class="logo"/>
                <div class="button-area">
                    <b-button
                        v-for="button of buttons"
                        tag="router-link"
                        :key="button.key"
                        :to="button.to"
                        :label="$translation.get('button.' + button.key)"
                        type="is-primary"/>
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
            buttons: [
                { key: "randompoem", to: { name: "RandomPoem" } },
                { key: "login", to: { name: "Login" } },
                { key: "register", to: { name: "Register" } },
            ],
            demoPoem: [
                { text: "With building blocks to practice and refine" },
                { text: "your scansion skills will grow with every line" },
            ],
            demoProgress: []
        }
    }
}
</script>