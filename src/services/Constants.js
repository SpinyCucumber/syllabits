import Service from './Service'
import { StressType, BlockType, Enum, BlockTypeEnum } from '@/models'

const Unstressed = new StressType('breve.svg');
const Stressed = new StressType('ictus.svg');

export default new Service({

    name: 'constants',

    StressTypes: new Enum({ Unstressed, Stressed }),

    BlockTypes: new BlockTypeEnum({
        Iamb: new BlockType('i', [Unstressed, Stressed]),
        Trochee: new BlockType('t', [Stressed, Unstressed]),
        Dactyl: new BlockType('d', [Stressed, Unstressed, Unstressed]),
        Anapest: new BlockType('a', [Unstressed, Unstressed, Stressed]),
        Spondee: new BlockType('s', [Stressed, Stressed]),
        Pyrrhic: new BlockType('p', [Unstressed, Unstressed]),
    })

});