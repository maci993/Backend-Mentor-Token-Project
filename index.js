const express = require("express");
const cors = require("cors");
const { expressjwt: jwt } = require("express-jwt");
const { getSection } = require("./pkg/config");
const fileUpload = require('express-fileupload');
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

const {
  sendMessage,
  sendWelcomeMail,
  sendPasswordResetMail,
} = require("./handlers/mailer");

const {
  upload,
  removeFiles,
} = require("./handlers/storage")

require("./pkg/db");

const app = express();

// middlewares
app.use(cors());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static(__dirname + '/uploads'));
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
      "/api/auth/reset-password/:id/:token",
      "/api/best-performing-mentors",
      "/api/upload"
    ],
  })
);

// user routes-authentication
app.post("/api/auth/login", login);
app.post("/api/auth/register", register);
app.get("/api/auth/refresh-token", refreshToken);
app.post("/api/auth/reset-password/:id/:token", resetPassword);
app.post("/api/auth/forgot-password", forgotPassword);
app.post("/api/users", createUser);
app.get("/api/users/:id", getOneUser);
app.get("/api/users", getAllUsers);
app.put("/api/auth/:id", updateAccount);

//mailer routes
app.post("/api/sendmessage", sendMessage);
app.post("/api/sendmail", sendWelcomeMail);
app.post("/api/reset-pass", sendPasswordResetMail);

//job routes
app.post("/api/jobs", createJobs);
app.get("/api/jobs", getAll);
app.get("/api/jobs/:id", getJobsById);
app.put("/api/jobs/:id", updateJobs);
app.delete("/api/jobs/:id", removeJobs);

// job application routes
app.post("/api/jobapplications", createJobApplication);
app.get("/api/jobapplications", getAllJobApplications);
app.get("/api/jobapplication/:id", getOneJobApplication);
app.put("/api/jobapplications/:id", updateJobApplication);
app.delete("/api/jobapplication/:id", removeJobApplication);

//
app.get("/api/mentors", getAllMentors);
app.get("/api/companies", getAllCompanies);
app.get("/api/statistics/:id", getStatistics);
app.get("/api/best-performing-mentors", getBestPerformingMentors);
app.post("/api/offer-job", offerJob);
app.delete("/api/jobs/:id", deleteJobOffer);
app.put("/api/jobs/:jobId", updateJobStatus);

//quick overview routes
app.get("/api/overview-stats", getStartupStatistics);
app.get("/api/overview-stats-mentors", getMentorStatistics);

//routes for upload and delete photos
app.post("/api/upload", upload);
app.delete("/api/files/:fileName", removeFiles);

app.listen(getSection("development").port, () => {
  console.log(`Server started at port ${getSection("development").port}`);
});
