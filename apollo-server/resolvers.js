import dataManager from './data-manager'

export default {
  Node: {
    __resolveType(node) {
      return node.nodeType;
    }
  },

  Query: {
    node: (obj, args) => dataManager.getNode(args.id),
  },

  Poem: {
    lines(obj) {
      // Internally, the poem lines are represented in a one-dimensional array,
      // with an optional 'stanza break' field to indicate a new stanza.
      // We convert the line array into a two-dimensional array, where each subarray
      // represents a stanza. We also attach a line number to each line.
      const { lines } = obj;
      let stanzaArr = [];
      let lineArr = [];
      for (let i = 0; i < lines.length; i++) {
        // Copy line object and assign line number
        let newLine = {...lines[i]};
        newLine.number = i;
        // If the line starts a new stanza, we write the current lines to the stanza array
        // and begin a new line arr
        if (newLine.stanzaBreak) {
          stanzaArr.push(lineArr);
          lineArr = [];
        }
        // Push line to array
        lineArr.push(newLine);
      }
      // Push final lines to stanza arary
      stanzaArr.push(lineArr);
      return stanzaArr;
    }
  },

  Mutation: {
    randomPoem() {
      return dataManager.poems[Math.floor(Math.random() * dataManager.poems.length)];
    },
    checkLine(obj, args) {
      const { poemID, lineNum, answer } = args.input;
      const poem = dataManager.getNode(poemID);
      const key = poem.lines[lineNum].key;
      // Construct response
      // answer and key should be same length
      let correct = true;
      let hintIndicies = [];
      for (let i = 0; i < 5; i++) {
        if (answer[i] != key[i]) {
          correct = false;
          hintIndicies.push(i);
        }
      }
      // Done
      return { correct, hintIndicies };
    }
  },

}
