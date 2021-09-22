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
  },

}
