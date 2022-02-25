<template>
    <scene type="is-centered is-aligned">
        <template #content-area>
            <div class="splash-view">
                <div class="page">
                    <div class="text-area">
                        <div class="title-box">
                            <h1 class="branding">SyllaBits</h1>
                            <img :src="$assets.getIcon('divider')" class="divider"/>
                        </div>
                        <div class="demo-poem">
                            <poem-line
                                v-for="(line, i) in demoPoem"
                                :has-number="false"
                                :key="i"
                                :line="line"
                                :automatic-feedback="true"
                                :progress="demoProgress[i]"
                                :check-handler="(holding) => checkLine(i, holding)"/>
                        </div>
                    </div>
                </div>
                <div class="page">
                    <img :src="$assets.getTexture('logo')" class="logo"/>
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
            </div>
        </template>
        <template #background-area>
            <carousel :image-sources="images" image-type="muted"/>
        </template>
    </scene>
</template>

<script>
import { Scene, Carousel, PoemLine } from '@/components'
import { Assets, Constants } from '@/services'
import Vue from 'vue'

const { LineState } = Constants

export default {
    components: { Scene, Carousel, PoemLine },
    data() {
        return {
            images: ['paper1', 'paper2', 'paper3', 'paper4'].map(Assets.getTexture),
            buttons: [
                { key: "jumpin", to: { name: "RandomPoem" } },
                { key: "login", to: { name: "Login" } },
                { key: "register", to: { name: "Register" } },
            ],
            demoPoem: [
                { text: "With building blocks to practice and refine" },
                { text: "your scansion skills will grow with every line" },
            ],
            demoProgress: []
        }
    },
    created() {
        // Set up demo poem progress
        for (let i in this.demoPoem) {
            Vue.set(this.demoProgress, i, { holding: Array(5).fill(null), state: LineState.Unchecked, attempts: 0 });
        }
    },
    methods: {
        checkLine(number, holding) {
            // TODO
            console.log({number, holding});
        }
    }
}
</script>