/**
 * Handles encoding/decoding poem locations
 * Poem locations are BSON-encoded strings that identify a poem in a context
 * I.e. can be a "direct location" or identify a poem using a collection and an index
 */
class PoemLocation {

    constructor(fields) {
        Object.assign(this, fields);
    }

    encode() {
        const json = JSON.stringify(this);
        return Buffer.from(json).toString("base64");
    }
    
}

/**
 * Models a block type
 * Each block type has a single-character code to identify it,
 * and a stress pattern defined by a sequence of StressTypes
 */
class BlockType {

    constructor(code, stresses) {
        this.code = code;
        this.stresses = stresses;
    }

}

/**
 * Constructed using an object where the keys are the name of the value,
 * and the values are the args used to initiate the value.
 */
class Enum {

    constructor(values, initializer) {
        // We also maintain an array to allow users to iterate over all possible values
        this.values = [];

        const isArray = Array.isArray(values);
        for (let key in values) {

            let name, value;
            if (isArray) {
                name = values[key];
                value = initializer ? initializer() : {};
            }
            else {
                name = key;
                value = values[name];
                if (initializer) value = initializer(value);
            }
            
            this.values.push(value);

            value.name = name;
            const symbol = name[0].toUpperCase() + name.slice(1);
            this[symbol] = value;

        }
    }

}

/**
 * A specialized enum where values can be serialized/parsed.
 * The value type must expose a "code" property, which is a single character;
 * this code is used to construct a lookup table to parse enum values,
 * and is also used to serialize values.
 */
class SerializableEnum extends Enum {

    constructor(values, initializer) {
        super(values, initializer);
        // Create lookup table using code
        this.lookup = {};
        this.values.forEach(value => {
            this.lookup[value.code] = value;
        })
    }

    /**
     * Finds the enum value corresponding to code
     */
    forCode(code) {
        return this.lookup[code];
    }

}

export { default as clone } from './clone'
export { PoemLocation, BlockType, Enum, SerializableEnum };