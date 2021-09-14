import dataManager from './data-manager'

export default {
  Node: {
    __resolveType(node) {
      return node.nodeType;
    }
  },

  Query: {
    randomPoem: () => dataManager.poems[0],
    node: (obj, args) => dataManager.getNode(args.id),
  },

}
