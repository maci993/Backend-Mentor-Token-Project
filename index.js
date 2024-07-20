const express = require("express");
const cors = require('cors');
const { expressjwt: jwt } = require("express-jwt");
const { getSection } = require("./pkg/config");
require('dotenv').config();

const {
  login,
  register,
  refreshToken,
  resetPassword,
} = require("./handlers/auth");

const {
    getAll,
    getJobsById,
    createJobs,
    updateJobs,
    removeJobs,
  } = require("./handlers/job");

  const {
    getAllJobApplications,
    createJobApplication,
    updateJobApplication,
    removeJobApplication,
  } = require("./handlers/application");

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
    ],
  })
);

app.post("/api/auth/login", login);
app.get("/api/auth/refresh-token", refreshToken);
app.post("/api/auth/register", register);
app.post("/api/auth/reset-password", resetPassword);

app.get("/api/jobs", getAll);
app.get("/api/jobs/:id", getJobsById);
app.post("/api/jobs", createJobs);
app.put("/api/jobs/:id", updateJobs);
app.delete("/api/jobs/:id", removeJobs);

app.get("/api/jobapplications", getAllJobApplications);
app.post("/api/jobapplications", createJobApplication);
app.put("/api/jobapplications", updateJobApplication);
app.delete("/api/jobapplication/:id", removeJobApplication);


// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

app.listen(getSection("development").port, () => {
    console.log(`Server started at port ${getSection("development").port}`);
  });
  