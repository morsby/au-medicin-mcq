import { gql } from 'apollo-server-express';
import { Context } from 'graphql/apolloServer';
import QuestionUserAnswer from 'models/question_user_answer';
import User from 'models/user';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import QuestionCommentLike from 'models/question_comment_like';
import QuestionBookmark from 'models/question_bookmark';
import QuestionComment from 'models/question_comment';

export const typeDefs = gql`
  extend type Query {
    user: User
    checkUsernameAvailability: Boolean
  }

  extend type Mutation {
    login(data: LoginInput): String
    signup(data: UserInput): String
    logout: String
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
    email: String
    password: String
    role: Role
    bookmarks: [Bookmark]
    answers(semester: Int): [Answer]
    specialtyVotes: [SpecialtyVote]
    tagVotes: [TagVote]
    likes: [Like]
    manualCompletedSets: [ManualCompletedSet]
    publicComments(semester: Int): [Comment]
    privateComments(semester: Int): [Comment]
  }

  type Role {
    id: Int
  }

  type Bookmark {
    id: Int
    question: Question
    user: User
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
      if (!ctx.user) return null;
      const user = await ctx.userLoaders.userLoader.load(ctx.user.id);
      return { id: user.id };
    }
  },

  Mutation: {
    login: async (root, { data: { username, password } }, ctx: Context) => {
      let user: Partial<User> = await User.query().findOne({ username });
      if (!user) throw new Error('Username or password is invalid');
      const isValidPassword = user.verifyPassword(password);
      if (!isValidPassword) throw new Error('Username or password is invalid');
      user = _.pick(user, ['id', 'username', 'email']);
      const token = jwt.sign(user, process.env.SECRET);
      ctx.res.cookie('user', token);
      return 'Logged in';
    },
    logout: (root, args, ctx: Context) => {
      ctx.res.cookie('user', null, { expires: new Date(0) });
      return 'Logged out';
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
    answers: async ({ id }, { semester }) => {
      let query = QuestionUserAnswer.query().where({ userId: id });

      if (semester) {
        query = query
          .join('question', 'questionUserAnswer.questionId', 'question.id')
          .join('semesterExamSet', 'question.examSetId', 'semesterExamSet.id')
          .where('semesterExamSet.semesterId', semester);
      }

      const answers = await query;
      return answers.map((answer) => ({ id: answer.id }));
    },
    likes: async ({ id }) => {
      const likes = await QuestionCommentLike.query().where({ userId: id });
      return likes.map((like) => ({ id: [like.commentId, like.userId] }));
    },
    bookmarks: async ({ id }, args, ctx: Context) => {
      const bookmarks = await QuestionBookmark.query().where({ userId: id });
      return bookmarks.map((bookmark) => ({ id: bookmark.id }));
    },
    publicComments: async ({ id }, { semester }, ctx: Context) => {
      let query = QuestionComment.query().where({ userId: id, private: 0 });

      if (semester) {
        query = query
          .join('question', 'questionComment.questionId', 'question.id')
          .join('semesterExamSet', 'question.examSetId', 'semesterExamSet.id')
          .where('semesterExamSet.semesterId', semester);
      }

      const publicComments = await query;
      return publicComments.map((pubC) => ({ id: pubC.id }));
    },
    privateComments: async ({ id }, { semester }, ctx: Context) => {
      let query = QuestionComment.query().where({ userId: id, private: 1 });

      if (semester) {
        query = query
          .join('question', 'questionComment.questionId', 'question.id')
          .join('semesterExamSet', 'question.examSetId', 'semesterExamSet.id')
          .where('semesterExamSet.semesterId', semester);
      }

      const privateComments = await query;
      return privateComments.map((priC) => ({ id: priC.id }));
    }
  },

  Bookmark: {
    id: ({ id }) => id,
    question: async ({ id }, args, ctx: Context) => {
      const bookmark = await ctx.userLoaders.bookmarkLoader.load(id);
      return { id: bookmark.questionId };
    }
  }
};