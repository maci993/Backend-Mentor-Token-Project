const mongoose = require("mongoose");

const ApplicationSchema = mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationType: {
      type: String,
      enum: ["mentorToCompany", "companyToMentor"],
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      required: true,
    },
    acceptedStatus: {
      type: String,
      enum: ["done", "rejected", "in progress"],
      required: true,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model(
  "Application",
  ApplicationSchema,
  "applications"
);

// console.log('Application model created:', Application);

const createApplication = async (data) => {
  const application = new Application(data);
  // console.log('Application instance created:', application);
  return await application.save();
};

const getAllApplications = async () => {
  return await Application.find({});
};

const updateApplication = async (id, data) => {
  data.updated_at = new Date();
  return await Application.updateOne(id, data, { new: true });
};

const removeApplication = async (id) => {
  return await Application.deleteOne({ _id: id });
};

module.exports = {
  createApplication,
  getAllApplications,
  updateApplication,
  removeApplication,
};
