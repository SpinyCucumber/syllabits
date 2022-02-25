import Service from './Service'
import root from '/translation'

/**
 * Randomly chooses an element from an array.
 */
function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

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
        // If the value is an array, we randomly choose a string
        // If not, simply return the value
        if (Array.isArray(value)) return choose(value);
        return value;
    }

});