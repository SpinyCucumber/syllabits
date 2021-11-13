<template>
    <scene>
        <template #content-area>
            <div class="dashboard">
                <div
                    v-for="widget in widgets"
                    :key="widget.key"
                    class="widget-container">
                    <div class="widget">
                        <h3 class="widget-title">
                            {{ $translation.get('widget.' + widget.key) }}
                        </h3>
                        <component
                            :is="widget.component"
                            v-bind="widget.props"
                            class="inner"/>
                    </div>
                </div>
            </div>
        </template>
        <template #background-area>
            <background-image :src="$assets.getTexture('Books')" class="muted"/>
        </template>
    </scene>
</template>

<script>
import { PoemList, Scene, BackgroundImage } from '@/components'
import { inProgress as inProgressQuery } from '@/queries'

export default {
    name: 'Dashboard',
    components: { Scene, BackgroundImage },

    data() {
        return {
            widgets: [
                {
                    key: 'resume',
                    component: PoemList,
                    props: { query: inProgressQuery },
                },
            ]
        }
    }
}
</script>