<template>
  <scene>
    <template #content-area>
        <!-- Testing -->
        <connection
            :query="browsePoemsQuery"
            :component="PoemEntry"
            field="allPoems"
            prop="poem"
            :perPage="10"/>
    </template>
    <template #background-area>
        <background-image :src="$assets.getTexture('Books')" class="muted"/>
    </template>
  </scene>
</template>

<script>
import { Scene, BackgroundImage, Connection } from '@/components'
import { browsePoems as browsePoemsQuery } from '@/queries'
import Vue from 'vue'

// Define components used to render lists
const PoemEntry = Vue.component('PoemEntry', {
    props: { poem: {required: true} },
    render() {
        return (
            <tr>
                <td>{this.poem.title}</td>
            </tr>
        )
    }
})

export default {
    name: 'Browse',
    components: { Scene, BackgroundImage, Connection },
    setup() {
        return { PoemEntry, browsePoemsQuery };
    }
}
</script>