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
  forgotPassword,
  createUser,
  getOneUser,
  getAllUsers,
  getBestPerformingMentors,
  // getAllMentors,
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
    getOneJobApplication,
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
      "/api/best-performing-mentors", 
    ],
  })
);

app.post("/api/jobs/apply/:id", async (req, res) => {
  console.log("Request params:", req.params);
  const jobId = req.params.id;

  try {
      const application = await createJobApplication(jobId);
      res.status(200).json({ message: "Application submitted successfully", application });
  } catch (error) {
      console.error("Error applying to job:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/auth/login", login);//raboti
app.post("/api/auth/register", register);//raboti
app.get("/api/auth/refresh-token", refreshToken);
app.post("/api/auth/reset-password", resetPassword);//raboti
app.post('/api/forgot-password', forgotPassword);//raboti
app.post('/api/users', createUser);//raboti
app.get('/api/users/:id', getOneUser);//raboti
app.get('/api/users', getAllUsers);//raboti
app.get("/api/best-performing-mentors", getBestPerformingMentors)
// app.get("/api/mentors", getAllMentors);

app.post("/api/jobs", createJobs);//raboti
app.get("/api/jobs", getAll);//raboti
app.get("/api/jobs/:id", getJobsById);//raboti
app.put("/api/jobs/:id", updateJobs);// raboti
app.delete("/api/jobs/:id", removeJobs);//ne raboti


app.post("/api/jobapplications", createJobApplication);//raboti
app.get("/api/jobapplications", getAllJobApplications);//raboti
app.get("/api/jobapplication/:id", getOneJobApplication);//raboti
app.put("/api/jobapplications/:id", updateJobApplication);//raboti
app.delete("/api/jobapplication/:id", removeJobApplication);//raboti




// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

app.listen(getSection("development").port, () => {
    console.log(`Server started at port ${getSection("development").port}`);
  });
  