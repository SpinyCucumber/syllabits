// Describes the different types of blocks players can select.
// Each block type corresponds to one type of foot.
// The color of each block type is specified in the config file.

import Config from '/config'

class Enum {

    constructor(members) {
        this.values = [];
        Object.entries(members).forEach(([name, member]) => {
            this[name] = member;
            this.values.push(member);
            member.name = name;
        });
    }

    values() {
        return this.values;
    }

}

export class StressType {

    constructor(iconPath) {
        this.icon = require(`../assets/${iconPath}`);
    }

}

export class BlockType {

    constructor(stresses) {
        this.stresses = stresses;
    }

    get color() {
        return Config.blockColors[this.name];
    }

}

const Unstressed = new StressType('breve.svg');
const Stressed = new StressType('ictus.svg');

export const StressTypes = new Enum({ Unstressed, Stressed });

export const BlockTypes = new Enum({
    Iamb: new BlockType([Unstressed, Stressed]),
    Trochee: new BlockType([Stressed, Unstressed]),
    Dactyl: new BlockType([Stressed, Unstressed, Unstressed]),
    Anapest: new BlockType([Unstressed, Unstressed, Stressed]),
    Spondee: new BlockType([Stressed, Stressed]),
    Pyrrhic: new BlockType([Unstressed, Unstressed]),
});