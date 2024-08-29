const { Account } = require("../pkg/account/index");
const { Job } = require("../pkg/Job/index");
const { Application } = require("../pkg/jobApplication/index");

const getStartupStatistics = async (req, res) => {
  try {
    const jobs = await Job.find({
      updatedAt: { $gte: oneMonthAgo },
      status: { $in: ["Direct", "Open"] }
    });
    const oneMonthAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    const totalJobs = jobs.length;

    const totalAssignedJobs = jobs.filter(
      (job) =>
        (job.status === "done" && job.updatedAt >= oneMonthAgo) ||
        (job.status === "in progress" && job.updatedAt >= oneMonthAgo)
    ).length;

    const finishedJobs = jobs.filter(
      (job) => job.status === "done" && job.updatedAt >= oneMonthAgo
    ).length;

    const appliedJobs = await Application.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    let data = {
      totalJobs,
      appliedJobs,
      totalAssignedJobs,
      finishedJobs,
    };

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching statistics:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getMentorStatistics = async (req, res) => {
try {
  const oneMonthAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
  
const mentors = await Account.find({ type: "mentor" });
const totalMentors = mentors.length;

const totalAssignedJobs = jobs.filter(
  (job) =>
    (job.status === "done" && job.updatedAt >= oneMonthAgo) ||
    (job.status === "in progress" && job.updatedAt >= oneMonthAgo)
).length;

const finishedJobs = jobs.filter(
  (job) => job.status === "done" && job.updatedAt >= oneMonthAgo
).length;

let data1 = {
totalMentors,
totalAssignedJobs,
finishedJobs,
}

return res.status(200).json(data1);
} catch (err) {
  console.error("Error fetching statistics:", err);
  return res.status(500).json({ message: "Internal Server Error" });
}
};

module.exports = {
  getStartupStatistics,
  getMentorStatistics,
};
