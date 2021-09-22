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

export class StressType {

    constructor(iconPath) {
        this.icon = require(`../assets/${iconPath}`);
    }

}

// Describes the different types of blocks players can select.
// Each block type corresponds to one type of foot.
// The color of each block type is specified in the config file.
// TODO Should most likely move this to another file
export class BlockType {

    constructor(code, stresses) {
        this.code = code;
        this.stresses = stresses;
    }

}

class BlockTypesEnum extends Enum {

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
        return sequence.map(blockType => blockType.code).join("");
    }

}

const Unstressed = new StressType('breve.svg');
const Stressed = new StressType('ictus.svg');

const StressTypes = new Enum({ Unstressed, Stressed });

const BlockTypes = new BlockTypesEnum({
    Iamb: new BlockType('i', [Unstressed, Stressed]),
    Trochee: new BlockType('t', [Stressed, Unstressed]),
    Dactyl: new BlockType('d', [Stressed, Unstressed, Unstressed]),
    Anapest: new BlockType('a', [Unstressed, Unstressed, Stressed]),
    Spondee: new BlockType('s', [Stressed, Stressed]),
    Pyrrhic: new BlockType('p', [Unstressed, Unstressed]),
});

export default { BlockTypes, StressTypes };