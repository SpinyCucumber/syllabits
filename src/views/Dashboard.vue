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
import { Scene, BackgroundImage, Connection, PoemCard } from '@/components'
import { inProgress as inProgressQuery, completed as completedQuery } from '@/queries'
import Vue from 'vue'

// Construct components used by widgets
const InProgressList = Vue.component('InProgressList', {
    render(create) {
        return create(Connection, {
            props: {
                query: inProgressQuery,
                field: 'poemsInProgress',
                component: PoemCard,
                prop: 'poem',
            }
        })
    }
})

const CompletedList = Vue.component('CompletedList', {
    render(create) {
        return create(Connection, {
            props: {
                query: completedQuery,
                field: 'completedPoems',
                component: PoemCard,
                prop: 'poem',
            }
        })
    }
})

export default {
    name: 'Dashboard',
    components: { Scene, BackgroundImage },

    data() {
        return {
            widgets: [
                { key: 'resume', component: InProgressList, },
                { key: 'repeat', component: CompletedList, },
            ]
        }
    }
}
</script>