// Handles retrieving nodes by ID
class DataManager {

    constructor(poems) {
        this.poems = poems;
        // Construct a table mapping IDs to nodes
        this.nodes = {};
        this.poems.forEach(poem => {
            this.nodes[poem.id] = { nodeType: 'Poem', ...poem}
        });
    }

    getNode(id) {
        return this.nodes[id];
    }

}

import poems from './poems/processed.json'

export default new DataManager(poems);