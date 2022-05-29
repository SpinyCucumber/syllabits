<template>
    <navbar-view>
        <scene class="navbar-view-content">
            <template #content-area>
                <div class="dashboard">
                    <div
                        v-for="widget in widgets"
                        :key="widget.key"
                        class="widget-container">
                        <div class="scene-content submenu gap-1">
                            <h3 class="has-text-grey">
                                {{ $translation.get('widget.' + widget.key) }}
                            </h3>
                            <component :is="widget.component"/>
                        </div>
                    </div>
                </div>
            </template>
            <template #background-area>
                <background-image :src="$assets.getTexture('books')" :stretched="true" class="muted"/>
            </template>
        </scene>
    </navbar-view>
</template>

<script>
import { Scene, BackgroundImage, PoemCard } from '@/components'
import { InProgress, Completed } from '@/queries'
import { Translation } from '@/services'
import NavbarView from './NavbarView'

function PoemListWidget({connectionOptions, cardOptions = {}, placeholder}) {
    return {
        apollo: { connection: connectionOptions }, 
        methods: { placeholder },
        computed: {
            poems() {
                return this.connection?.edges.map(edge => edge.node);
            }
        },
        render(h) {
            if (!this.poems) return;
            if (this.poems.length) return (
                <div class="submenu gap-1">
                    {this.poems.map(poem => h(PoemCard, { props: {poem, ...cardOptions}}))}
                </div>
            )
            else return this.placeholder();
        }
    }
}

// Construct components used by widgets
const placeholderButtons = [
    { to: {name: 'RandomPoem'}, key: 'jumpin'},
    { to: {name: 'Browse'}, key: 'find'},
];
const InProgressList = PoemListWidget({
    connectionOptions: {
        query: InProgress,
        update: data => data.me.inProgress,
        fetchPolicy: 'cache-and-network',
    },
    placeholder() {
        return (
            <div class="submenu is-centered">
                <p>{Translation.get('placeholder.inprogress')}</p>
                <footer class="submenu-footer">
                    {placeholderButtons.map(button => (
                        <b-button
                            type="is-primary"
                            tag="router-link"
                            to={button.to}
                            label={Translation.get('button.' + button.key)}
                        />
                    ))}
                </footer>
            </div>
        )
    }
})

const CompletedList = PoemListWidget({
    connectionOptions: {
        query: Completed,
        update: data => data.me.completed,
        fetchPolicy: 'cache-and-network',
    },
    placeholder() {
        return (<p>{Translation.get('placeholder.completed')}</p>)
    },
    cardOptions: { type: 'is-completed' },
})

export default {
    name: 'Dashboard',
    components: { Scene, BackgroundImage, NavbarView },

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