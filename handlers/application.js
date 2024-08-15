const {
    createApplication,
    getAllApplications,
    getOneApplication,
    updateApplication,
    removeApplication,
} = require("../pkg/jobApplication/index");

const { getJobById, updateJob } = require("../pkg/Job/index");

const createJobApplication = async (req, res) => {
  try {
    const { jobId, mentorId, companyId, applicationType } = req.body;

    if (!jobId || !mentorId || !companyId || !applicationType) {
      return res.status(400).send("Missing required fields");
    }

    const newApplication = await createApplication(req.body);
    res.status(200).send(newApplication);
  } catch (err) {
    console.log("Error creating job application:", err);
    res.status(500).send("Internal Server Error!");
  }
  // try {
  //   const newApplication = await createApplication(req.body);
  //   res.status(200).send(newApplication);
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).send("Internal Server Error!");
  // }
};

const getOneJobApplication = async (req, res) => {
  try {
    const application = await getOneApplication(req.params.id);
    if (!application) {
      return res.status(404).send("Application not found");
    }
    return res.status(200).send(application);
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

const getAllJobApplications = async (req, res) => {
  try {
    const applications = await getAllApplications();
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving applications", error: err });
  }
    // try {
    //   const applications = await getAllApplications();
    //   res.status(200).send(applications);
    // } catch (err) {
    //   console.log(err);
    //   res.status(500).send("Internal Server Error!");
    // }
  };


  // const updateApplication = async (req, res) => {
  //   try {
  //     const updatedApplication = await updateApp(req.params.id, req.body);
  
  //     if (!updatedApplication) {
  //       return res.status(404).send("Application not found");
  //       if (!updatedApplication) {
  //         return res.status(404).send("Application not found");
  //       }
  //       return res.status(200).send(updatedApplication);
  //     } catch (err) {
  //       return res.status(500).send("Internal Server Error");
  //     }
  //   };
  const updateJobApplication = async (req, res) => {
    try {
      const applicationId = req.params.id;
      const updatedApplication = await updateApplication(applicationId, req.body);
      //update job offer status
      if (req.body.status === "accepted") {
        await updateOffer(updatedApplication.job_offer_id, req.status.body);
        //update job document in jobs collection
        const job = await getJobById(updatedApplication.job_offer_id);
        if (job) {
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
    getOneJobApplication,
    createJobApplication,
    updateJobApplication,
    removeJobApplication,
  };
  

