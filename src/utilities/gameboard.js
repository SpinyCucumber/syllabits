import ObjectID from 'bson-objectid'
import { Constants } from '@/services'
const { LineState } = Constants;

/**
 * Finds differences between a submitted answer and a key
 * Assumes the answer and the key are the same length
 * Returns a list of indicies of differences
 */
 function findConflicts(key, answer) {
    let conflicts = [];
    for (let i = 0; i < key.length; i++) {
        if (key[i] !== answer[i]) {
            conflicts.push(i);
        }
    }
    return conflicts;
}

/**
 * Compares a submitted line answer to an answer key, returning an object
 * The returned object contains a 'correct' property. If correct is false,
 * it optionally contains a 'conflicts' property which contains the indicies of conflicting feet.
 */
function checkLine(key, answer) {
    if (key.length !== answer.length) return { correct: false };
    let conflicts = findConflicts(key, answer);
    return { correct: (conflicts.length === 0), conflicts };
}

/**
 * Creates an empty gameboard line
 */
 function makeLine() {
    return {
        id: ObjectID().toHexString(),
        text: '',
        key: new Array(5).fill(''),
        stanzaBreak: false,
    }
}

/**
 * Creates an empty 'line progress' object used to track
 * the status of a Gameboard line
 */
function makeLineProgress(numFeet) {
    return { holding: Array(numFeet).fill(''), state: LineState.UNCHECKED, attempts: 0 };
}

export { findConflicts, checkLine, makeLine, makeLineProgress, }