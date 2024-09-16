const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const {
  create,
  getByEmail,
  setNewPassword,
  getAll,
  update,
  remove,
  getById,
  Account,
  // getMentors,
} = require("../pkg/account");
// console.log(Account);
const {
  validate,
  AccountLogin,
  AccountRegister,
  AccountReset,
} = require("../pkg/account/validate");

const { Job } = require("../pkg/Job/index");

const { getSection } = require("../pkg/config");

const login = async (req, res) => {
  try {
    // await validate(req.body, AccountLogin);
    const { email, password } = req.body;
    const account = await getByEmail(email);

    if (!account) {
      return res.status(400).send("Account not found!");
    }
    if (!bcrypt.compareSync(password, account.password)) {
      return res.status(400).send("Wrong password!");
    }
    console.log(account, "Account from login");

    const payload = {
      name: account.name,
      email: account.email,
      id: account._id,
      type: account.type,
      // exp: new Date().getTime() / 1000 + 7 * 24 * 60 * 60, // 7 dena vo idnina
    };
    console.log("test before token");
    const token = jwt.sign(payload, getSection("development").jwt_secret);
    return res.status(200).send({ token });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const register = async (req, res) => {
  try {
    console.log("Received data:", req.body);
    const {
      email,
      password,
      confirmPassword,
      name,
      type,
      skills,
      phone,
      desc,
      representative,
      address,
    } = req.body;
    await validate(req.body, AccountRegister);

    if (!email || !password || !confirmPassword || !name || !type) {
      console.log("Missing basic fields:", {
        email,
        password,
        confirmPassword,
        name,
        type,
      });
      return res.status(400).send("All fields are required!");
    }

    if (type === "mentor" && (!skills || !phone || !desc)) {
      return res.status(400).send("Mentor-specific fields are required!");
    }

    if (type === "startup" && (!representative || !address)) {
      return res.status(400).send("Startup-specific fields are required!");
    }

    const exists = await getByEmail(email);

    if (exists) {
      return res.status(400).send("Account with this email already exists!");
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .send("Confirm password is not the same as password!");
    }
    req.body.password = bcrypt.hashSync(password);

    const acc = await create(req.body);
    return res.status(201).send(acc);
  } catch (err) {
    console.log(err);
    return res.status(err.status).send(err.error);
  }
};

const refreshToken = async (req, res) => {
  const payload = {
    ...req.auth,
    exp: new Date().getTime() / 1000 + 7 * 24 * 60 * 60, // 7 dena vo idnina
  };

  const token = jwt.sign(payload, getSection("development").jwt_secret);
  return res.status(200).send({ token }); // req.auth
};

const resetPassword = async (req, res) => {
  await validate(req.body, AccountReset);
  const { newPassword, oldPassword, email } = req.body;

  const account = await getByEmail(email);

  // console.log("account data", account);

  if (!account) {
    return res.status(400).send("Account with this email does not exist!");
  }

  // Incorrect old password
  if (!bcrypt.compareSync(oldPassword, account.password)) {
    return res.status(400).send("Incorrect old password!");
  }

  if (newPassword === oldPassword) {
    return res.status(400).send("New password cannot be old password!");
  }

  const newPasswordHashed = bcrypt.hashSync(newPassword);

  const userPasswordChanged = await setNewPassword(
    account._id.toString(),
    newPasswordHashed
  );
  // console.log("userPass", userPasswordChanged);

  return res.status(200).send(userPasswordChanged);
};

const forgotPassword = async (req, res) => {
  // korisnikot dali postoi vo nasata databaza, go barame istiot po email
  const exists = await getByEmail(req.body.email);
  if (!exists) {
    return res.status(400).send("Account with this email does not exist!");
  }

  res.send("OK");
};

const createUser = async (req, res) => {
  try {
    const newAccount = await create(req.body);
    return res.status(200).send(newAccount);
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

const getOneUser = async (req, res) => {
  try {
    const account = await getById({ _id: req.params.id });
    if (!account) {
      return res.status(404).send("User not found!");
    }
    res.status(200).send(account);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { type } = req.query;
    let filter = {};

    if (type) {
      filter.type = type;
    }
    const account = await getAll(filter);
    res.status(200).send(account);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
};

const getAllMentors = async (req, res) => {
  try {
    const mentors = await getAll({ type: "mentor" });
    res.status(200).send(mentors);
  } catch (err) {
    console.error("Error fetching mentors:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllCompanies = async (req, res) => {
  try {
    const companies = await getAll({ type: "startup" });
    res.status(200).send(companies);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).send("Internal Server Error");
  }
};

const updateAccount = async (req, res) => {
  try {
    // console.log("Updating user with ID:", req.params.id);
    // console.log("Updated data:", req.body);

    const userId = req.params.id;
    const updatedData = req.body;

    const updatedUser = await Account.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).send("User not found!");
    }
    // console.log("User after update:", updatedUser);
    res.status(200).send(updatedUser);
  } catch (err) {
    console.error("Error updating user information:", err);
    res.status(500).send("Internal Server Error");
  }
};
const deleteAccount = async (req, res) => {
  try {
    const account = await remove(req.params.id);
    if (!account) {
      return res.status(404).send("User not found!");
    }
    res.status(200).send("User deleted successfully!");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const getStatistics = async (req, res) => {
  const userId = req.params.id;
  // console.log(Job);
  try {
    const jobs = await Job.find({ companyId: userId });

    //total assigned jobs
    const totalAssignedJobs = jobs.length;

    //finished jobs
    const finishedJobs = jobs.filter((job) => job.finishedDate).length;

    //statistics data
    const statisticsData = {
      totalAssignedJobs,
      finishedJobs,
      jobs: jobs.map((job) => ({
        title: job.title,
        status: job.status,
        finishedDate: job.finishedDate,
      })),
    };

    res.status(200).json(statisticsData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getBestPerformingMentors = async (rew, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const mentors = await Account.find({ type: "mentor" });

    //based on completed jobs from the last month
    const bestMentors = mentors
      .map((mentor) => ({
        name: mentor.name,
        completedJobs: mentor.mentorAccomplishments?.completedJobs || 0,
        photo: mentor.photo || null,
        updatedAt: mentor.updatedAt,
      }))
      .filter(
        (mentor) => mentor.updatedAt >= oneMonthAgo && mentor.completedJobs > 0
      )
      .sort((a, b) => b.completedJobs - a.completedJobs)
      .slice(0, 3);

    res.status(200).json(bestMentors);
  } catch (error) {
    console.error(" Error fetching best performing mentors", error);
    res.status(500).json({ message: "internal server Error" });
  }
};

module.exports = {
  login,
  register,
  resetPassword,
  forgotPassword,
  refreshToken,
  createUser,
  getOneUser,
  getAllUsers,
  updateAccount,
  deleteAccount,
  getAllMentors,
  getAllCompanies,
  getStatistics,
  getBestPerformingMentors,
};
