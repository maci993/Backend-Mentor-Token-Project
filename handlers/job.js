const { createJob, getAllJobs, getJobById, updateJob, removeJob } = require("../pkg/Job/index");

const { getSection } = require("../pkg/config");

const getAll = async (req, res) => {
  try {
    const jobs = await getAllJobs();
    res.status(200).send(jobs);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error!");
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

const createJobs = async (req, res) => {
  try {
    await createJob(req.body);
    res.status(201).send("Job created!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error!");
  }
};

const updateJobs = async (req, res) => {
  try {
    await updateJob(req.params.id, req.body);
    res.status(204).send(`Job updated: ${req.params.id}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error!");
  }
};

const removeJobs = async (req, res) => {
  try {
    await removeJob(req.params.id);
    res.status(204).send(`Job deleted: ${req.params.id}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error!");
  }
};

module.exports = {
  getAll,
  getJobsById,
  createJobs,
  updateJobs,
  removeJobs,
};
