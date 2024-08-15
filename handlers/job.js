const { createJob, getAllJobs, getJobById, updateJob, removeJob } = require("../pkg/Job/index");

const { createApplication } = require ('../pkg/jobApplication/index')
const { getSection } = require("../pkg/config");

const createJobs = async (req, res) => {
  try {
    const newJob = await createJob(req.body);
    return res.status(200).send(newJob);
  } catch (err) {
    console.error("Error creating job:", err);
    return res.status(500).send("Internal Server Error");
  }
};

const getJobsById = async (req, res) => {
  try {
    const job = await getJobById(req.params.id);
    res.status(200).send(job);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error!");
  }
};

const getAll = async (req, res) => {
  try {
    const jobs = await getAllJobs();
    res.status(200).send(jobs);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error!");
  }
};

const updateJobs = async (req, res) => {
  try {
    const updatedJobs = await updateJob(req.params.id, req.body);
    if (!updatedJobs) {
      return res.status(404).send("Job not found");
    }
    return res.status(200).send(updatedJobs);
  } catch (err) {
    console.error("Error updating Job:", err);
    return res.status(500).send("Internal Server Error");
  }
};

const removeJobs = async (req, res) => {
  try {
    const deletedJob = await removeJob(req.params.id);
    if (!deletedJob) {
      return res.status(404).send("Job not found");
    }
    return res.status(200).send("Job deleted successfully");
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id; 

    const applicationData = {
      jobId: jobId,
      mentorId: userId,
      companyId: req.body.companyId, 
      status: "pending", 
      acceptedStatus: "in progress", 
    };

    const newApplication = await createApplication(applicationData);
    res.status(200).json(newApplication);
  } catch (err) {
    console.error("Error applying to job:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAll,
  getJobsById,
  createJobs,
  updateJobs,
  removeJobs,
  applyToJob,
};
