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
        let obj = new Object(value);
        Object.defineProperty(obj, 'stresses', {
            value: stresses,
            writable: false,
        });
        return obj;
    }
);

/**
 * A simple role system for calculating permissions
 * Permissions determine which parts of the app are visible.
 * The user's role is retrieved from the server as part of the JWT.
 */
const Role = new Enum({
        USER: [0, {}],
        EDITOR: [1, {has: ['poem.edit'], inherits: ['USER']}],
        ADMIN: [2, {has: ['user.manage'], inherits: ['EDITOR']}],
    },
    ([value, options]) => {
        let obj = new Object(value);
        let {has = [], inherits = []} = options;
        // Define properties for new role
        Object.defineProperty(obj, 'perms', {
            get() {
                if (this._perms !== undefined) return this._perms;
                let perms = new Set(has);
                for (const parent of inherits) {
                    // Add permissions of parent to our perms
                    for (const perm of Role[parent].perms) perms.add(perm);
                }
                this.perms = perms;
                return perms;
            }
        });
        Object.defineProperty(obj, 'hasPerm', {
            value(perm) {
                return this.perms.has(perm);
            }
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
    StressType, BlockType, LineState, SlotMode, FeedbackType, LocationType, Role
});