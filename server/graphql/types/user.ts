import { gql } from 'apollo-server-express';
import { Context } from 'graphql/apolloServer';
import QuestionUserAnswer from 'models/question_user_answer';
import User from 'models/user';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import QuestionCommentLike from 'models/question_comment_like';

export const typeDefs = gql`
  extend type Query {
    user: User
    checkUser: User
    checkUsernameAvailability: Boolean
  }

  extend type Mutation {
    login(data: LoginInput): String
    signup(data: UserInput): String
    editUser(data: UserEditInput): String
    forgotPassword(email: String!): String
    resetPassword(token: String!, values: String): String
    manualCompleteSet(setId: Int!, userId: Int!): String
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input UserInput {
    username: String!
    password: String!
    email: String
  }

  input UserEditInput {
    password: String
    email: String
  }

  type User {
    id: Int
    username: String
    password: String
    role: Role
    bookmarks: [Bookmark]
    answers: [Answer]
    specialtyVotes: [SpecialtyVote]
    tagVotes: [TagVote]
    likes: [Like]
    manualCompletedSets: [ManualCompletedSet]
    publicComments: [Comment]
    privateComments: [Comment]
  }

  type Role {
    id: Int
  }

  type Bookmark {
    id: Int
  }

  type Profile {
    id: Int
  }

  type ManualCompletedSet {
    id: Int
  }
`;

export const resolvers = {
  Query: {
    user: async (_root, _args, ctx: Context) => {
      const user = await ctx.userLoaders.userLoader.load(ctx.user.id);
      return { id: user.id };
    },
    checkUser: (root, args, ctx: Context) => {
      if (!ctx.user) throw new Error('No user recieved');
      return { id: ctx.user.id };
    }
  },

  Mutation: {
    login: async (root, { data: { username, password } }) => {
      let user: Partial<User> = await User.query().findOne({ username });
      if (!user) throw new Error('Username or password is invalid');
      const isValidPassword = user.verifyPassword(password);
      if (!isValidPassword) throw new Error('Username or password is invalid');
      user = _.pick(user, ['id', 'username', 'email']);
      return jwt.sign(user, process.env.SECRET);
    },
    signup: async (root, { data }) => {
      const user = User.query().insert(data);
      return jwt.sign(user, process.env.SECRET);
    }
  },

  User: {
    id: ({ id }) => id,
    username: async ({ id }, _, ctx: Context) => {
      const user = await ctx.userLoaders.userLoader.load(id);
      return user.username;
    },
    password: async ({ id }, _, ctx: Context) => {
      const user = await ctx.userLoaders.userLoader.load(id);
      return user.password;
    },
    role: async ({ id }, _, ctx: Context) => {
      const user = await ctx.userLoaders.userLoader.load(id);
      return { id: user.roleId };
    },
    answers: async ({ id }) => {
      const answers = await QuestionUserAnswer.query().where({ userId: id });
      return answers.map((answer) => ({ id: answer.id }));
    },
    likes: async ({ id }) => {
      const likes = await QuestionCommentLike.query().where({ userId: id });
      return likes.map((like) => ({ id: [like.commentId, like.userId] }));
    }
  }
};
