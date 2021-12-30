<template>
    <b-tabs class="find-view">
        <b-tab-item
            v-for="tab in tabs"
            :key="tab.key"
            :label="$translation.get('tab.' + tab.key)">
            <Table v-bind="tab.tableOptions"/>
        </b-tab-item>
    </b-tabs>
</template>

<script>
import { SearchPoems } from '@/queries'
import { Constants, TranslationService } from '@/services'
import { PoemLocation } from '@/utilities'
import { Table } from '@/components'
import Vue from 'vue'

const { LocationType } = Constants;

const PoemEntry = Vue.component('PoemEntry', {
    props: { entry: Object },
    methods: {
        dropdownItems() {
            let dropdownItems = [
                <b-dropdown-item onClick={this.play} class="has-text-primary">
                    {TranslationService.get('button.play')}
                </b-dropdown-item>,
                <b-dropdown-item onClick={this.share}>
                    {TranslationService.get('button.share')}
                </b-dropdown-item>
            ];
            if (this.$store.getters.isAdmin) dropdownItems = [...dropdownItems, 
                <b-dropdown-item onClick={this.edit}>
                    {TranslationService.get('button.edit')}
                </b-dropdown-item>
            ];
            return dropdownItems;
        },
        play() {
            // When user selects a poem, navigate to the play menu
            const location = new PoemLocation({t: LocationType.DIRECT, p: this.entry.id}).encode();
            this.$router.push({name: 'Play', params: {location}});
        },
        edit() {
            this.$router.push({name: 'Edit', params: {poemID: this.entry.id}});
        },
        share() {
            // TODO
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
                        {this.dropdownItems()}
                    </b-dropdown>
                </td>
            </tr>
        )
    },
})

export default {

    name: 'Find',
    components: { Table },
    
    data() {
        return {
            tabs: [
                {
                    key: 'poems',
                    tableOptions: {
                        connectionOptions: { query: SearchPoems, update: data => data.poems },
                        searchOptions: { placeholder: TranslationService.get('placeholder.search.poem') },
                        orderByOptions: ['relevance', 'title', 'author'],
                        enableCategories: true,
                        entryComponent: PoemEntry,
                        perPage: 8,
                    },
                }
            ],
        }
    },

}
</script>