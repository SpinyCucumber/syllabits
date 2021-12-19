<template>
    <b-tabs class="find-view">
        <b-tab-item
            v-for="tab in tabs"
            :key="tab.key"
            :label="$translation.get('tab.' + tab.key)">
            <search v-bind="tab.searchOptions"/>
        </b-tab-item>
    </b-tabs>
</template>

<script>
import { searchPoems } from '@/queries'
import { Constants } from '@/services'
import { PoemLocation } from '@/utilities'
import { Search } from '@/components'
import Vue from 'vue'

const { LocationType } = Constants;

const PoemEntry = Vue.component('PoemEntry', {
    props: { entry: Object },
    methods: {
        play() {
            // When user selects a poem, navigate to the play menu
            const location = new PoemLocation({t: LocationType.DIRECT, p: this.entry.id}).encode();
            this.$router.push({name: 'Play', params: {location}});
        }
    },
    render() {
        return (
            <tr onDblclick={this.play}>
                <td><span>{this.entry.title}</span></td>
                <td><span class="has-text-grey">{this.entry.author}</span></td>
                <td>
                    <b-dropdown position="is-bottom-left" scopedSlots={
                        {
                            trigger() {
                                return (<b-button class="borderless" icon-left="dots-horizontal"/>);
                            }
                        }}>
                        <b-dropdown-item onClick={this.play} class="has-text-primary">
                            {this.$translation.get('button.play')}
                        </b-dropdown-item>
                        <b-dropdown-item>
                            {this.$translation.get('button.share')}
                        </b-dropdown-item>
                    </b-dropdown>
                </td>
            </tr>
        )
    },
})

export default {

    name: 'Find',
    components: { Search },
    
    data() {
        return {
            tabs: [
                {
                    key: 'poems',
                    searchOptions: {
                        connectionOptions: { query: searchPoems, update: data => data.allPoems },
                        entryComponent: PoemEntry,
                        perPage: 9,
                    },
                }
            ],
        }
    },

}
</script>