import Service from './Service'
import { Enum, SerializableEnum, BlockType } from '@/utilities'

const StressTypes = new Enum(['unstressed', 'stressed']);
const U = StressTypes.Unstressed, S = StressTypes.Stressed;

const BlockTypes = new SerializableEnum({
    iamb: ['i', [U, S]],
    trochee: ['t', [S, U]],
    spondee: ['s', [S, S]],
    pyrrhic: ['p', [U, U]],
    dactyl: ['d', [S, U, U]],
    anapest: ['a', [U, U, S]],
}, (args) => new BlockType(...args));

const LineState = new Enum(['unchecked', 'checking', 'correct', 'incorrect']);
const SlotMode = new Enum(['slot', 'bucket', 'locked']);
const FeedbackType = new Enum(['perfect', 'great', 'good', 'okay', 'incorrect']);
const LocationType = {Direct: 0, Collection: 1};

export default new Service({
    name: 'constants',
    StressTypes, BlockTypes, LineState, SlotMode, FeedbackType, LocationType
});