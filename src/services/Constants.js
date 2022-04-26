import Service from './Service'
import { Enum } from '@/utilities'

const StressType = new Enum({ UNSTRESSED: 0, STRESSED: 1, });
const U = StressType.UNSTRESSED, S = StressType.STRESSED;

/**
 * Models a block type
 * Each block type has a String value to identify it,
 * and a stress pattern defined by a sequence of StressTypes
 */
const BlockType = new Enum({
        IAMB: ['i', [U, S]],
        TROCHEE: ['t', [S, U]],
        SPONDEE: ['s', [S, S]],
        PYRRHIC: ['p', [U, U]],
        DACTYL: ['d', [S, U, U]],
        ANAPEST: ['a', [U, U, S]],
    },
    ([value, stresses]) => {
        let obj = new String(value);
        Object.defineProperty(obj, 'stresses', {
            value: stresses,
            writable: false,
        });
        return obj;
    }
);

const LineState = new Enum({ UNCHECKED: 0, CHECKING: 1, CORRECT: 2, INCORRECT: 3, });
const SlotMode = new Enum({ SLOT: 0, BUCKET: 1, LOCKED: 2, });
const FeedbackType = new Enum({ PERFECT: 0, GREAT: 1, GOOD: 2, OKAY: 3, INCORRECT: 4, });
const LocationType = new Enum({ DIRECT: 0, COLLECTION: 1, });

export default new Service({
    name: 'constants',
    StressType, BlockType, LineState, SlotMode, FeedbackType, LocationType
});