const {
    createApplication,
    getAllApplications,
    updateApplication,
    removeApplication,
} = require("../pkg/jobApplication/index");

const { getJobById, updateJob } = require("../pkg/Job/index");

const getAllJobApplications = async (req, res) => {
    try {
      const applications = await getAllApplications();
      res.status(200).send(applications);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error!");
    }
  };

  const createJobApplication = async (req, res) => {
    try {
      await createApplication(req.body);
      res.status(201).send("Job application created!");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error!");
    }
  };

  const updateJobApplication = async (req, res) => {
    // try {
    //   await updateApplication(req.params.id, req.body);
    //   res.status(204).send(`Job application updated: ${req.params.id}`);
    // } catch (err) {
    //   console.log(err);
    //   res.status(500).send("Internal Server Error!");
    // }
    try {
      const applicationId = req.params.id;
      const updatedApplication = await updateApplication(applicationId, req.body);
      //update job offer status
      if (req.body.status === "accepted") {
        await updateOffer(updatedApplication.job_offer_id, req.status.body);
        //update job document in jobs collection
        const job = await getJobById(updatedApplication.job_offer_id);
        if (job) {
          // if (!job.mentor_ids.includes(updatedApplication.mentor_id)) {
          //   job.mentor_ids.push(updatedApplication.mentor_id);
          // }
          if (job.status === "pending") {
            job.status = "in_progress";
          }
          await updateJob(job._id, job);
        }
      }
      res.status(204).send(`Job application updated ${applicationId}`);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error!");
    }
  };

  const removeJobApplication = async (req, res) => {
    try {
      await removeApplication(req.params.id);
      res.status(204).send(`Job application deleted: ${req.params.id}`);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error!");
    }
  };

  module.exports = {
    getAllJobApplications,
    createJobApplication,
    updateJobApplication,
    removeJobApplication,
  };
  

