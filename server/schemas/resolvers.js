const { AuthenticationError } = require('apollo-server-express');
const { User, Plan, Day, Activity } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // if there is user token in req headers, return user data, or else throw err
      if (context.user) {
        return User.findOne({ _id: context.user._id })
          .populate('myPlans');
      }

      throw new AuthenticationError('You need to be logged in');
    },
    // get all users for search selection
    allUsers: async () => {
      return User.find();
    },
    allTravelPlans: async (parent, args, context) => {
      if (context.user) {
        return Plan.find();
      }

      throw new AuthenticationError('You need to be logged in');
    },
    searchPlansByUser: async (parent, { username }) => {
      if (context.user) {
        return User.findOne({ username })
          .populate('myPlans');
      }

      throw new AuthenticationError('You need to be logged in');
    },
    singlePlan: async (parent, { _id }) => {
      if (context.user) {
        return Plan.findOne({ _id })
          .populate('days');
      }

      throw new AuthenticationError('You need to be logged in');
    }
  },

  Mutation: {
    createUser: async (parent, args) => {
      // create user
      const user = await User.create(args);

      // create token and return them
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      // get user by its email
      const user = await User.findOne({ email });

      // if no user found by the email, throw err
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // check if the user's password is correct or not
      const correctPwd = await user.isCorrectPassword(password);

      // if the password did not match, throw err
      if (!correctPwd) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // if credentials matches, create token for the user and return them
      const token = signToken(user);
      return { token, user };
    },
    createPlan: async (parent, args, context) => {
      if (context.user) {
      const plan = await Plan.create({...args, username: context.user.username})

      await User.findOneAndUpdate(
        { _id: context.user._id },
        { $push: {myPlans: plan._id}},
        {new: true },
        );
      
      return plan;
      }
      throw new AuthenticationError('You need to be logged in');
    },

    editPlan: async(parent, args, context) => {
      if (context.user){
        const plan = await Plan.findOneAndUpdate(
          {_id: context.plan._id},
          args,
          {new: true}
        );
        return plan;
      }
      throw new AuthenticationError('You need to be logged in');
    },


    removePlan: async (parent, { _id }) => {
      if (context.user) {
        await Plan.findOneAndDelete({ _id });

        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { myPlans: _id } },
          { new: true }
        );
      }

      throw new AuthenticationError('You need to be logged in');
    },

    createDay: async (parent, { planId, input }, context) => {
      if (context.user) {
        const dayData = await Day.create(input);

        return await Plan.findOneAndUpdate(
          { _id: planId },
          { $push: { days: dayData } },
          { new: true }
        );
      }

      throw new AuthenticationError('You need to be logged in');
    },

    removeDay: async (parent, { planId, _id }, context) => {
      if (context.user) {
        await Day.findOneAndDelete({ _id });

        return await Plan.findOneAndUpdate(
          { _id: planId },
          { $pull: { days: _id } },
          { new: true }
        );
      }

      throw new AuthenticationError('You need to be logged in');
    },

    createActivity: async (parent, args, context) => {
      if (context.user) {
        const activity = await Activity.create({args})

        await Day.findOneAndUpdate(
          { _id: context.day._id},
          {$push: {activities: activity._id}},
          {new: true}
          );
          
          return activity;
        }
      throw new AuthenticationError('You need to be logged in');
    },

    editActivity: async (parent, { dayId, input }, context) => {
      if (context.user) {
        const activity = await Activity.findOneAndUpdate(
          { _id: input._id }, args, { new: true }
        );
    
        await Day.findOneAndUpdate(
          { _id: dayId }, { activities: activity }, { new: true }
        );
    
        return activity;
      }
      throw new AuthenticationError('You need to be logged in');
    },

    removeActivity: async (parent, { dayId, _id }) => {
      if (context.user) {
        await Activity.findOneAndDelete({ _id });

        return await Day.findOneAndUpdate(
          { _id: dayId },
          { $pull: { activities: _id } },
          { new: true }
        );
      }

      throw new AuthenticationError('You need to be logged in');      
    }
  }
};

module.exports = resolvers;
