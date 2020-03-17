var express = require('express');
var graphqlHTTP = require('express-graphql');
var graphql = require('graphql');

// var schema = buildSchema(`
//     type User {
//         id: String
//         name: String
//     },

//     type Query {
//         user(id: String): User
//     }
// `);


var fakeDatabase = {
    'a': {
        id: 'a',
        name: 'alice',
      },
      'b': {
        id: 'b',
        name: 'bob',
      },
};

const userType = new graphql.GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: graphql.GraphQLString },
        name: { type: graphql.GraphQLString },
    }
});

const queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        user: {
            type: userType,
            args: {
                id: { type: graphql.GraphQLString }
            },
            resolve: (_, { id }) => {
                return fakeDatabase[id];
            }
        }
    }
});

// const loggingMiddleware = (req, res, next) => {
//     console.log('ip:', req.ip);
//     next();
// }

var app = express();
// app.use(loggingMiddleware);
var schema = new graphql.GraphQLSchema({ query: queryType });

app.use('/graphql', graphqlHTTP({
    schema: schema,
    // rootValue: root,
    //context: any
    //pretty: boolean
    //formatError: ? Function
    //validationRules: ? Array
    graphiql: true,
}));

app.listen(5500, () => console.log('Running GraphQl Server'));