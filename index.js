const express = require("express");
const cors = require("cors");
const { expressjwt: jwt } = require("express-jwt");
const { getSection } = require("./pkg/config");
require("dotenv").config();

const {
  login,
  register,
  refreshToken,
  resetPassword,
  forgotPassword,
  createUser,
  getOneUser,
  getAllUsers,
  updateAccount,
  getAllMentors,
  getAllCompanies,
  getStatistics,
  getBestPerformingMentors,
} = require("./handlers/auth");

const {
  getAll,
  getJobsById,
  createJobs,
  updateJobs,
  removeJobs,
  offerJob,
  deleteJobOffer,
  updateJobStatus,
} = require("./handlers/job");

const {
  getAllJobApplications,
  getOneJobApplication,
  createJobApplication,
  updateJobApplication,
  removeJobApplication,
} = require("./handlers/application");

const {
  getStartupStatistics,
  getMentorStatistics,
} = require("./handlers/overviewHandler");

require("./pkg/db");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(
  jwt({
    secret: getSection("development").jwt_secret,
    algorithms: ["HS256"],
  }).unless({
    path: [
      //dokolku sme na nekoja od ovie pateki nema da ni bara da bideme avtenticirani
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/best-performing-mentors",
    ],
  })
);

app.post("/api/jobs/apply/:id", async (req, res) => {
  console.log("Request params:", req.params);
  const jobId = req.params.id;

  try {
    const application = await createJobApplication(jobId);
    res
      .status(200)
      .json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Error applying to job:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/auth/login", login);
app.post("/api/auth/register", register);
// console.log("Received DATA", req.body);
app.get("/api/auth/refresh-token", refreshToken);
app.post("/api/auth/reset-password", resetPassword);
app.post("/api/forgot-password", forgotPassword);
app.post("/api/users", createUser);
app.get("/api/users/:id", getOneUser);
app.get("/api/users", getAllUsers);
app.put("/api/auth/:id", updateAccount);

app.post("/api/jobs", createJobs);
app.get("/api/jobs", getAll);
app.get("/api/jobs/:id", getJobsById);
app.put("/api/jobs/:id", updateJobs);
app.delete("/api/jobs/:id", removeJobs);

app.post("/api/jobapplications", createJobApplication);
app.get("/api/jobapplications", getAllJobApplications);
app.get("/api/jobapplication/:id", getOneJobApplication);
app.put("/api/jobapplications/:id", updateJobApplication);
app.delete("/api/jobapplication/:id", removeJobApplication);

app.get("/api/mentors", getAllMentors);
app.get("/api/companies", getAllCompanies);
app.get("/api/statistics/:id", getStatistics);
app.get("/api/best-performing-mentors", getBestPerformingMentors);
app.post("/api/offer-job", offerJob);
app.delete("/api/jobs/:id", deleteJobOffer);
app.put("/api/jobs/:jobId", updateJobStatus);

app.get("/api/overview-stats", getStartupStatistics);
app.get("/api/overview-stats-mentors", getMentorStatistics);

app.listen(getSection("development").port, () => {
  console.log(`Server started at port ${getSection("development").port}`);
});
