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
  return await Account.findOne({ _id: id });
};

const getByEmail = async (email) => {
  return await Account.findOne({ email });
};

const setNewPassword = async (id, password) => {
  return await Account.updateOne({ _id: id, password });
};

const getAll = async () => {
  return await Account.find({});
};

const update = async (id, acc) => {
  return await Account.updateOne({ _id: id }, acc);
};

const remove = async (id) => {
  return await Account.deleteOne({ _id: id });
};

module.exports = {
  create,
  getById,
  getByEmail,
  setNewPassword,
  getAll,
  update,
  remove,
};
