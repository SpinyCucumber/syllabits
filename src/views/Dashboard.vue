<template>
    <div class="dashboard">
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
    </div>
</template>

<script>
import { PoemList } from '@/components'
import { inProgress as inProgressQuery } from '@/queries'

export default {
    name: 'Dashboard',

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