import { Constants } from '@/services'
import Vue from 'vue';

/**
 * Stores information about the state of the game, and exposes convenient ways to modify it.
 * This involves storing what block types are present at different slots on different lines.
 */
export default class PlayState {

    createLine() {
        return {
            state: Constants.LineState.Unchecked,
            holding: new Array(5).fill(null),
        }
    }

    initializeEmpty() {
        this.lines = [];
    }

    getLine(index) {
        if (index in this.lines) {
            return this.lines[index];
        }
        let line = this.createLine();
        Vue.set(this.lines, index, line);
        return line;
    }

}