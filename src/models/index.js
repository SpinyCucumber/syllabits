class Enum {

    constructor(members) {
        this.values = [];
        Object.entries(members).forEach(([name, member]) => {
            this[name] = member;
            this.values.push(member);
            member.name = name;
        });
    }

}

class StressType {

    constructor(iconID) {
        this.iconID = iconID;
    }

}

// Describes the different types of blocks players can select.
// Each block type corresponds to one type of foot.
// The color of each block type is specified in the config file.
class BlockType {

    constructor(code, stresses) {
        this.code = code;
        this.stresses = stresses;
    }

}

class BlockTypeEnum extends Enum {

    constructor(members) {
        super(members);
        // Create lookup table using code
        this.codeLookup = {};
        this.values.forEach(blockType => {
            this.codeLookup[blockType.code] = blockType;
        })
    }

    // Parses a string into a sequence of block types using the types' code
    parseSequence(string) {
        return [...string].map(char => this.codeLookup[char]);
    }

    // Serializes a sequence of block types into a string using the types' code
    serializeSequence(sequence) {
        return sequence.map(blockType => blockType.code).join('');
    }

}

export { Enum, BlockTypeEnum, BlockType, StressType };