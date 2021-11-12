<template>
    <reader class="dashboard">
        <template #content-area>
            <div
                v-for="widget in widgets"
                :key="widget.key"
                class="widget">
                <h3 class="widget-title">{{ $translation.get('widget.' + widget.key) }}</h3>
                <component
                    :is="widget.component"
                    v-bind="widget.props"
                    class="inner"/>
            </div>
        </template>
        <template #background-area>
            <background-image :src="$assets.getTexture('Books')" class="muted"/>
        </template>
    </reader>
</template>

<script>
import { PoemList, Reader, BackgroundImage } from '@/components'
import { inProgress as inProgressQuery } from '@/queries'

export default {
    name: 'Dashboard',
    components: { Reader, BackgroundImage },

    data() {
        return {
            widgets: [
                {
                    key: 'resume',
                    component: PoemList,
                    props: { query: inProgressQuery },
                }
            ]
        }
    }
}
</script>