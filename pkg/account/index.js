const mongoose = require("mongoose");

const accountSchema = mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ["mentor", "startup"],
        required: true,
      },
      skills: {
        type: [String],
        required: function () {
          return this.type === "mentor";
        },
      },
      desc: {
        type: String,
        required: function () {
          return this.type === "mentor";
        },
      },
      acceptedJobs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Job",
        required: function () {
          return this.type === "mentor";
        },
      },
      phone: {
        type: String,
        required: function () {
          return this.type === "mentor";
        },
      },
      representative: {
        type: String,
        required: function () {
          return this.type === "startup";
        },
      },
      address: {
        type: String,
        required: function () {
          return this.type === "startup";
        },
      },
      jobsPosted: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Job",
        required: function () {
          return this.type === "startup";
        },
      },
    },
    { timestamps: true }
  );

const Account = mongoose.model("Account", accountSchema, "accounts");

const create = async (acc) => {
  const account = new Account(acc);
  return await account.save();
};

const getById = async (id) => {
  // return await Account.findOne({ _id: id });
  try {
    return await Account.findById(id);
  } catch (error) {
    console.error("Error in getById:", error);
    throw error;
  }
};

const getByEmail = async (email) => {
  return await Account.findOne({ email });
};

const setNewPassword = async (id, password) => {
  return await Account.updateOne({ _id: id, password }, { new: true});
};

// const getAll = async () => {
//   return await Account.find({});
// };

const getAll = async (filter = {}) => { return await Account.find(filter); };

const update = async (id, acc) => {
  return await Account.updateOne({ _id: id }, acc);
};

const remove = async (id) => {
  return await Account.deleteOne({ _id: id });
};

// const getMentors = async () => {
//   try {
//     const mentors = await Account.find({ type: "mentor" });
//     const sanitizedMentors = mentors.map(mentor => ({
//       ...mentor.toObject(),
//       status: mentor.status || 'No Status Available', // Fallback in case status is undefined
//     }));

//     return sanitizedMentors;
//   } catch (err) {
//     console.error("Error fetching mentors:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

module.exports = {
  create,
  getById,
  getByEmail,
  setNewPassword,
  getAll,
  update,
  remove,
  // getMentors,
};
