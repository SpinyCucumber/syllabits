import Service from './Service'
import { Enum, SerializableEnum, BlockType } from '@/utilities'

const StressTypes = new Enum(['Unstressed', 'Stressed']);
const U = StressTypes.Unstressed, S = StressTypes.Stressed;

const BlockTypes = new SerializableEnum({
    Iamb: ['i', [U, S]],
    Trochee: ['t', [S, U]],
    Dactyl: ['d', [S, U, U]],
    Anapest: ['a', [U, U, S]],
    Spondee: ['s', [S, S]],
    Pyrrhic: ['p', [U, U]],
}, (args) => new BlockType(...args));

const LineState = new Enum(['Unchecked', 'Checking', 'Correct', 'Incorrect']);
const SlotMode = new Enum(['Slot', 'Bucket', 'Locked']);
const FeedbackType = new Enum(['Perfect', 'Great', 'Good', 'Okay', 'Incorrect']);

export default new Service({
    name: 'constants',
    StressTypes, BlockTypes, LineState, SlotMode, FeedbackType,
});