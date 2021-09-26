import { Constants } from '@/services'

/**
 * Stores information about the state of the game, and exposes convenient ways to modify it.
 * This involves storing what block types are present at different slots on different lines.
 */
export default class PlayState {

    createLine() {
        return {
            state: Constants.LineState.Unchecked,
            holdingList: new Array(5).fill(null),
        }
    }

    initializeEmpty() {
        this.lines = new Map();
    }

    getLine(index) {
        if (!this.lines.has(index)) {
            let line = this.createLine();
            this.lines.set(index, line);
            return line;
        }
        return this.lines.get(index);
    }

}