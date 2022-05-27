<template>
    <tr @dblclick="play">
        <td><span>{{ entry.title }}</span></td>
        <td class="column-grow"><span class="has-text-grey">{{ entry.author }}</span></td>
        <td class="column-shrink">
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
</template>

<script>
export default {
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
            if (this.$store.getters.perms.has('poem.edit')) dropdownItems = [...dropdownItems, 
                <b-dropdown-item onClick={this.edit}>
                    {Translation.get('button.poem.edit')}
                </b-dropdown-item>
            ];
            return dropdownItems;
        },
        play() {
            // When user selects a poem, navigate to the play menu
            const location = new PoemLocation({t: LocationType.DIRECT, p: this.entry.id}).encode();
            this.$router.push({name: 'Gameboard', query: { location }});
        },
        edit() {
            this.$router.push({name: 'Gameboard', query: { mode: 'edit', poemID: this.entry.id }});
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
}
</script>