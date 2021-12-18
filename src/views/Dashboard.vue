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
import { Scene, BackgroundImage, PoemCard } from '@/components'
import { inProgress as inProgressQuery, completed as completedQuery } from '@/queries'
import { Connection } from '@/mixins'
import { TranslationService } from '@/services'
import Vue from 'vue'

const inProgressPlaceholder = [
    { to: {name: 'RandomPoem'}, key: 'jumpin'},
    { to: {name: 'Browse'}, key: 'browsepoems'},
]

function PoemListWidget({name, queryOptions, placeholder}) {
    return Vue.component(name, {
        mixins: [ Connection('poems', queryOptions) ],
        methods: { placeholder },
        render() {
            if (!this.poems) return;
            if (this.poems.length) return (
                <div class="poem-card-list">
                    {this.poems.map(poem => (
                        <PoemCard poem={poem}/>
                    ))}
                </div>
            )
            else return this.placeholder();
        }
    })
}

// Construct components used by widgets
const InProgressList = PoemListWidget({
    name: 'InProgressList',
    queryOptions: {
        query: inProgressQuery,
        update: data => data.me.inProgress,
        fetchPolicy: 'cache-and-network',
    },
    placeholder() {
        return (
            <div class="submenu is-centered">
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
        )
    }
})

const CompletedList = PoemListWidget({
    name: 'CompletedList',
    queryOptions: {
        query: completedQuery,
        update: data => data.me.completed,
        fetchPolicy: 'cache-and-network',
    },
    placeholder() {
        return (<p>{TranslationService.get('placeholder.completed')}</p>)
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