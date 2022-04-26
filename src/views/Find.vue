<template>
    <navbar-view class="find-view">
        <b-tabs class="find-view-tabs">
            <b-tab-item
                class="find-view-tab-item"
                v-for="tab in tabs"
                :key="tab.key"
                :label="$translation.get('tab.' + tab.key)">
                <Table v-bind="tab.tableOptions" class="find-view-table"/>
            </b-tab-item>
        </b-tabs>
    </navbar-view>
</template>

<script>
import { SearchPoems } from '@/queries'
import { Constants, Translation } from '@/services'
import { PoemLocation } from '@/utilities'
import { Table } from '@/components'
import NavbarView from './NavbarView'
import Vue from 'vue'

const { LocationType } = Constants;

const PoemEntry = Vue.component('PoemEntry', {
    props: { entry: Object },
    methods: {
        dropdownItems() {
            let dropdownItems = [
                <b-dropdown-item onClick={this.play} class="has-text-primary">
                    {Translation.get('button.poem.play')}
                </b-dropdown-item>,
                <b-dropdown-item onClick={this.share}>
                    {Translation.get('button.poem.share')}
                </b-dropdown-item>
            ];
            if (this.$store.getters.isAdmin) dropdownItems = [...dropdownItems, 
                <b-dropdown-item onClick={this.edit}>
                    {Translation.get('button.poem.edit')}
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
            // Construct play URL and write to clipboard
            const location = new PoemLocation({t: LocationType.DIRECT, p: this.entry.id}).encode();
            const url = window.location.origin + '/#/play/' + location;
            navigator.clipboard.writeText(url);
            // Show success message
            this.$buefy.toast.open({
                message: this.$translation.get('message.poem.share'),
                type: 'is-success',
            })
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
    components: { NavbarView, Table },
    
    data() {
        return {
            tabs: [
                {
                    key: 'poems',
                    tableOptions: {
                        connectionOptions: { query: SearchPoems, update: data => data.poems },
                        searchOptions: { placeholder: Translation.get('placeholder.poem.search') },
                        orderByOptions: ['relevance', 'title', 'author'],
                        enableCategories: true,
                        entryComponent: PoemEntry,
                    },
                }
            ],
        }
    },

}
</script>