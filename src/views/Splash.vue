<template>
    <scene type="is-centered is-aligned">
        <template #content-area>
            <div class="splash">
                <div class="splash-pane submenu is-aligned-start gap-2">
                    <div class="submenu">
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
                <div class="splash-pane submenu is-centered gap-2">
                    <img :src="$assets.getTexture('logo')" class="splash-logo"/>
                    <div class="splash-buttons submenu gap-1">
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
import { Assets } from '@/services'
import { makeLineProgress } from '@/utilities/gameboard'

export default {
    components: { Scene, Carousel, PoemLine },
    setup() {
        return {
            demoPoem: [
                { text: "With building blocks to practice and refine" },
                { text: "your scansion skills will grow with every line" },
            ],
        }
    },
    data() {
        return {
            images: ['paper1', 'paper2', 'paper3', 'paper4'].map(Assets.getTexture),
            buttons: [
                { key: "jumpin", to: { name: "RandomPoem" } },
                { key: "login", to: { name: "Login" } },
                { key: "register", to: { name: "Register" } },
            ],
            demoProgress: null,
        }
    },
    created() {
        // Set up demo poem progress
        this.demoProgress = Array.from(this.demoPoem, () => makeLineProgress(5));
    },
    methods: {
        checkLine(number, holding) {
            // TODO
            console.log({number, holding});
        }
    }
}
</script>