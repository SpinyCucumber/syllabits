<template>
  <scene type="is-aligned">
    <template #content-area>
        <!-- Testing -->
        <div class="scene-content">
            <connection
                :query="browsePoemsQuery"
                :component="PoemEntry"
                :map="(data) => data.allPoems"
                prop="poem"
                tag="table"
                class="poem-entry-list"
                :perPage="10"/>
        </div>
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
                <td>{this.poem.author}</td>
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