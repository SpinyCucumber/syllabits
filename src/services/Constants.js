import Service from './Service'
import { Enum, SerializableEnum } from '@/utilities'
import { BlockType } from '@/models'

const StressTypes = Enum.simple('Unstressed', 'Stressed');
const U = StressTypes.Unstressed, S = StressTypes.Stressed;

const BlockTypes = new SerializableEnum(BlockType.constructor, {
    Iamb: ['i', [U, S]],
    Trochee: ['t', [S, U]],
    Dactyl: ['d', [S, U, U]],
    Anapest: ['a', [U, U, S]],
    Spondee: ['s', [S, S]],
    Pyrrhic: ['p', [U, U]],
});

const LineStates = Enum.simple('Unchecked', 'Checking', 'Correct', 'Incorrect')

export default new Service({
    name: 'constants',
    StressTypes, BlockTypes, LineStates,
});