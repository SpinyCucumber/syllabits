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
import { TranslationService } from '@/services'
import Vue from 'vue'

function PoemListWidget({name, connection, placeholder}) {
    return Vue.component(name, {
        apollo: { connection }, 
        methods: { placeholder },
        computed: {
            poems() {
                return this.connection?.edges.map(edge => edge.node);
            }
        },
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
const placeholderButtons = [
    { to: {name: 'RandomPoem'}, key: 'jumpin'},
    { to: {name: 'Browse'}, key: 'browsepoems'},
];
const InProgressList = PoemListWidget({
    name: 'InProgressList',
    connection: {
        query: inProgressQuery,
        update: data => data.me.inProgress,
        fetchPolicy: 'cache-and-network',
    },
    placeholder() {
        return (
            <div class="submenu is-centered">
                <p>{TranslationService.get('placeholder.inprogress')}</p>
                <footer class="submenu-footer">
                    {placeholderButtons.map(button => (
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
    connection: {
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