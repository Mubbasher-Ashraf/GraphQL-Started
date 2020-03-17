var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
    input MessageInput {
        content: String
        author: String
    },
    type Message {
        id: ID!
        content: String
        author: String
    },
    type Randomdie {
        numSides: Int!
        rollOnce: Int!
        roll(numRolls: Int!): [Int]
    },
    type Query {
        ip: String
        quoteOfTheDay: String
        random: Float!
        getDie(numSides: Int): Randomdie
        getMessage(id: ID!): Message
    },

    type Mutation {
        createMessage(input: MessageInput): Message
        updateMessage(id: ID!, input: MessageInput): Message
    }
`);

class Message {
    constructor(id, { content, author }) {
        this.id = id;
        this.content = content;
        this.author = author;
    }
}

class RandomDie {
    constructor(numSides) {
        this.numSides = numSides;
    }
    rollOnce() {
        return 1 + Math.floor(Math.random() * this.numSides);
    }
    roll({ numRolls }) {
        var output = [];
        for (var i = 0; i < numRolls; i++) {
            output.push(this.rollOnce());
        }
        return output;
    }
}

var fakeDatabase = {};

var root = {
    ip: function(args, request) {
        return request.ip;
    },
    quoteOfTheDay: () => {
        return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within!';
    },
    random: () => {
        return Math.random();
    },
    setMessage: ({ message }) => {
        fakeDatabase.message = message;
        return message;
    },
    getMessage: ({ id }) => {
        if(!fakeDatabase[id]) {
            throw new Error('No message found with id : ' + id);
        }
        return new Message(id, fakeDatabase[id]);
    },
    createMessage: ({ input }) => {
        var id = require('crypto').randomBytes(10).toString('hex')

        fakeDatabase[id] = input;
        console.log(fakeDatabase)
        return new Message(id, input);
    },
    updateMessage: ({ id, input }) => {
        if(!fakeDatabase[id]) {
            throw new Error('No message found with id : ' + id);
        }
        fakeDatabase[id] = input;
        return new Message(id, input);
    },
    rollDice: ({ numDice, numSides }) => {
        var output = [];
        for (var i = 0; i < numDice ; i++) {
            output.push(1 + Math.floor(Math.random() * (numSides || 6) ));   
        }
        return output;
    },
    getDie: ({ numSides }) => {
        return new RandomDie(numSides || 6);
    }
};

const loggingMiddleware = (req, res, next) => {
    console.log('ip:', req.ip);
    next();
}

var app = express();
app.use(loggingMiddleware);

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(5500, () => console.log('Running GraphQl Server'));