const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        creator: User!
        createdAt: String!
        updatedAt: String!

    }


    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        post: [Post!]!

    }

    input userData {
        email: String!
        name: String!
        password: String!
    }

    input postData {
        title: String!
        content: String!
        imageUrl: String!

    }

    type message {
        message: String!
    }

    type MutationRoot {
        createUser(userInput: userData): User!, userName: String!
        createPost(postInput: postData): Post!
        deletePost(postId: String!): message!
        updateStatus(newStatus: String!): message!
    }

    type CurrentUser {
        token: String!
        userId: String!
    }

    type allPosts {
        posts: [Post!]!
        totalItems: Int!
    }

    type Status {
        status: String!
    }

    type Query {
        login(email: String!, password: String!): CurrentUser!
        getPosts(currentPage: Int!): allPosts!
        getStatus: Status!
    }

    schema {
        query: Query
        mutation: MutationRoot
    }

    
`);
