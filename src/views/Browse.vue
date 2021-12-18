<template>
  <scene type="is-aligned">
    <template #content-area>
        <!-- Testing -->
        <div class="scene-content">
            <!-- TODO Use buefy table -->
            <table class="poem-entry-list">
                <poem-entry v-for="poem in entries"
                    :key="poem.id"
                    :poem="poem"/>
            </table>
        </div>
    </template>
    <template #background-area>
        <background-image :src="$assets.getTexture('Books')" class="muted"/>
    </template>
  </scene>
</template>

<script>
import { Scene, BackgroundImage } from '@/components'
import { browsePoems as browsePoemsQuery } from '@/queries'
import { Connection } from '@/mixins'
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
    components: { Scene, BackgroundImage, PoemEntry },
    mixins: [ Connection({
        name: 'entries',
        queryOptions: {
            query: browsePoemsQuery,
            update: data => data.allPoems,
        }
    }) ],
    setup() {
        return { PoemEntry, browsePoemsQuery };
    }
}
</script>