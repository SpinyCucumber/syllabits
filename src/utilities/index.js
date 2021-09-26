/**
 * Constructed using an object where the keys are the name of the value,
 * and the values are the args used to initiate the value.
 */
class Enum {

    constructor(supplier, values) {
        // We also maintain an array to allow users to iterate over all possible values
        this.values = [];
        Object.entries(values).forEach(([name, initArgs]) => {
            // DEBUG
            console.log(initArgs);
            console.log(supplier);
            // Construct value
            let value = supplier(...initArgs);
            this[name] = value;
            this.values.push(value);
            value.name = name;
        });
    }

    /**
     * Shortcut to create an enum with no initialization arguments.
     */
    static simple(...names) {
        let values = {}
        names.forEach(name => {
            values[name] = [];
        })
        // Ugly JS syntax.
        return new Enum(() => { return {}; }, values);
    }

}

/**
 * A specialized enum where values can be serialized/parsed.
 * The value type must expose a "code" property, which is a single character;
 * this code is used to construct a lookup table to parse enum values,
 * and is also used to serialize values.
 */
class SerializableEnum extends Enum {

    constructor(supplier, values) {
        super(supplier, values);
        // Create lookup table using code
        this.lookup = {};
        this.values.forEach(value => {
            this.lookup[value.code] = value;
        })
    }

    /** 
     * Parses a string into a sequence of values using the values' code
     */
    parseSequence(string) {
        return [...string].map(char => this.lookup[char]);
    }

    /**
     * Serializes a sequence of values into a string using the values' code
     */
    serializeSequence(sequence) {
        return sequence.map(value => value.code).join('');
    }

}

export { Enum, SerializableEnum };