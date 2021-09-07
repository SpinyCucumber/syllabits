// Describes the different types of blocks players can select.
// Each block type corresponds to one type of foot.
// The color of each block type is specified in the config file.

import Config from 'config'

// An 'ictus' is used to represent a stressed syllable, and a 'breve' is used for an unstressed syllable.
const STRESSED = '\'', UNSTRESSED = '—'

class BlockType {

    static Iamb = new BlockType('Iamb', UNSTRESSED + STRESSED);
    static Trochee = new BlockType('Trochee', STRESSED + UNSTRESSED);
    static Dactyl = new BlockType('Dactyl', STRESSED + UNSTRESSED + UNSTRESSED);
    static Anapest = new BlockType('Anapest', UNSTRESSED + UNSTRESSED + STRESSED);
    static Spondee = new BlockType('Spondee', STRESSED + STRESSED);
    static Pyrrhic = new BlockType('Pyrrhic', UNSTRESSED + UNSTRESSED);

    constructor(name, notation) {
        this.name = name;
        this.notation = notation;
    }

    toString() {
        return `BlockType.${this.name}`;
    }

    get color() {
        return Config.blockColors[this.name];
    }

}

export default BlockType;