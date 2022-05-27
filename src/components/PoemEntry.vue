<template>
    <tr @dblclick="play">
        <td><span>{{ entry.title }}</span></td>
        <td class="column-grow"><span class="has-text-grey">{{ entry.author }}</span></td>
        <td class="column-shrink">
            <b-dropdown position="is-bottom-left">
                <template #trigger>
                    <b-button class="borderless" icon-left="dots-horizontal"/>
                </template>
                <b-dropdown-item @click="play" class="has-text-primary">
                    {{ $translation.get('button.poem.play') }}
                </b-dropdown-item>
                <b-dropdown-item @click="share">
                    {{ $translation.get('button.poem.share') }}
                </b-dropdown-item>
                <b-dropdown-item @click="edit" v-if="$store.getters.perms.has('poem.edit')">
                    {{ $translation.get('button.poem.edit') }}
                </b-dropdown-item>
            </b-dropdown>
        </td>
    </tr>
</template>

<script>
import { PoemLocation } from '@/utilities'
import { Constants } from '@/services'

const { LocationType } = Constants

export default {
    props: { entry: Object },
    methods: {
        play() {
            // When user selects a poem, navigate to the gameboard
            const location = new PoemLocation({t: LocationType.DIRECT, p: this.entry.id}).encode();
            this.$router.push({name: 'Gameboard', query: { location }});
        },
        edit() {
            this.$router.push({name: 'Gameboard', query: { mode: 'edit', poemID: this.entry.id }});
        },
        share() {
            // Construct play URL and write to clipboard
            const location = new PoemLocation({t: LocationType.DIRECT, p: this.entry.id}).encode();
            const url = `${window.location.origin}/#/gameboard?location=${location}`;
            navigator.clipboard.writeText(url);
            // Show success message
            this.$buefy.toast.open({
                message: this.$translation.get('message.poem.share'),
                type: 'is-success',
            })
        }
    },
}
</script>