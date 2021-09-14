// Handles retrieving nodes by ID
class DataManager {

    constructor(data) {
        Object.assign(this, data);
        // Construct a table mapping IDs to nodes
        this.nodes = {};
        this.poems.forEach(poem => {
            this.nodes[poem.id] = { nodeType: 'Poem', ...poem}
        });
        console.log(this.nodes);
    }

    getNode(id) {
        console.log(id);
        return this.nodes[id];
    }

}

import data from './data.json'

export default new DataManager(data);