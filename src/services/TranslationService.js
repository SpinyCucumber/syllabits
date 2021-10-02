import Service from './Service'
import root from '/translation'

export default new Service({

    name: 'translation',

    get(key) {
        // Each part of the key corresponds to a level in the translation table
        const names = key.split('.');
        let value = root;
        for (let name of names) {
            value = value[name];
            // If key is undefined show the key instead
            if (!value) return key;
        }
        return value;
    }

});