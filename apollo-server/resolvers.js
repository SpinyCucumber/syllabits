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

  Mutation: {
    randomPoem: () => {
      return dataManager.poems[Math.floor(Math.random() * dataManager.poems.length)];
    },
    checkLine: (obj, args) => {
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
