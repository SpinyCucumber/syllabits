import GraphQLJSON from 'graphql-type-json'
import config from './config'


export default {
  JSON: GraphQLJSON,

  Query: {
    randomPoem: () => config.poems[0]
  },

}
