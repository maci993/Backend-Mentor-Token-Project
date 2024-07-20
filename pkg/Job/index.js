const mongoose = require("mongoose");

const JobSchema = mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    skillsRequired: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["Direct", "Open"],
      required: true,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", JobSchema, "jobs");

const createJob = async (data) => {
    const job = new Job(data);
    return await job.save();
  };
  
  const getAllJobs = async () => {
    return await Job.find({});
  };
  
  const getJobById = async (id) => {
    return await Job.findOne({ _id: id });
  };
  
  const updateJob = async (id, data) => {
    data.updated_at = new Date();
    return await Job.updateOne(id, data, { new: true });
  };
  
  const removeJob = async (id) => {
    return await Job.deleteOne(id, { new: true });
  };
  
  module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    removeJob,
  };
  