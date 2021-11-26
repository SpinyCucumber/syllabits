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
import { TranslationService } from '@/services'
import Vue from 'vue'

const inProgressPlaceholder = [
    { to: {name: 'RandomPoem'}, key: 'jumpin'},
    { to: {name: 'BrowsePoems'}, key: 'browsepoems'},
]

// Construct components used by widgets
const InProgressList = Vue.component('InProgressList', {
    render() {
        return (
            <Connection
                query={inProgressQuery}
                component={PoemCard}
                field="inProgress"
                prop="poem">
                <div slot="placeholder" class="submenu is-centered">
                    <p>{TranslationService.get('placeholder.inprogress')}</p>
                    <footer class="submenu-footer">
                        {inProgressPlaceholder.map(button => (
                            <b-button
                                type="is-primary"
                                tag="router-link"
                                to={button.to}
                                label={TranslationService.get('button.' + button.key)}
                            />
                        ))}
                    </footer>
                </div>
            </Connection>
        )
    }
})

const CompletedList = Vue.component('CompletedList', {
    render() {
        return (
            <Connection
                query={completedQuery}
                component={PoemCard}
                field="completed"
                prop="poem">
                <div slot="placeholder" class="submenu is-centered">
                    <p>{TranslationService.get('placeholder.completed')}</p>
                </div>
            </Connection>
        )
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