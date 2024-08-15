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
      ref: "Account",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
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
  console.log("Creating job application with data:", data);

  const application = new Application(data);
  // console.log('Application instance created:', application);
  return await application.save();
};

const getAllApplications = async () => {
  return await Application.find({}).populate('jobId companyId mentorId', 'title name logo');;
};

const getOneApplication = async (id) => {
  return await Application.findById(id).populate('jobId companyId mentorId', 'title name logo');
};

const updateApplication = async (id, data) => {
  data.updated_at = new Date();
  return await Application.findByIdAndUpdate(id, data, { new: true });
};

const removeApplication = async (id) => {
  return await Application.findByIdAndDelete({ _id: id });
};

module.exports = {
  createApplication,
  getAllApplications,
  getOneApplication,
  updateApplication,
  removeApplication,
};
