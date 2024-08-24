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
console.log(Account);
const {
  validate,
  AccountLogin,
  AccountRegister,
  AccountReset,
} = require("../pkg/account/validate");

const { getSection } = require("../pkg/config");

const login = async (req, res) => {
  // koga se logirame ni se vrakja nov token
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
    return res.status(200).send({ token }); // req.auth
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const register = async (req, res) => {
  try {
    await validate(req.body, AccountRegister);
    const { email, password, confirmPassword, fullName } = req.body;
    const exists = await getByEmail(email);

    if (exists) {
      return res.status(400).send("Account with this email already exists!");
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .send("Confirm password is not the same as password!");
    }
    req.body.password = bcrypt.hashSync(password); // password-ot e sifriran i e nerazbirliv za nas lugjeto
    const acc = await create(req.body);
    return res.status(201).send(acc);
  } catch (err) {
    console.log(err);
    return res.status(err.status).send(err.error);
  }
};

const refreshToken = async (req, res) => {
  // koga pravime refresh na token na veke najaven korisnik ni se vrakja nov token so novo vazecko istekuvanje
  // req.auth postoi koga prethodno se generiral veke token
  const payload = {
    ...req.auth, // ova e nasiot korisnik koj prethodno bil najaven i probuva da go osvezi negoviot token
    exp: new Date().getTime() / 1000 + 7 * 24 * 60 * 60, // 7 dena vo idnina
  };

  const token = jwt.sign(payload, getSection("development").jwt_secret);
  return res.status(200).send({ token }); // req.auth
};

const resetPassword = async (req, res) => {
  await validate(req.body, AccountReset);
  const { newPassword, oldPassword, email } = req.body;

  const account = await getByEmail(email);

  console.log("account data", account);

  if (!account) {
    return res.status(400).send("Account with this email does not exist!");
  }

  // Incorrect old password
  if (!bcrypt.compareSync(oldPassword, account.password)) {
    return res.status(400).send("Incorrect old password!");
  }

  // Stariot password nemoze da bide kako noviot password
  if (newPassword === oldPassword) {
    return res.status(400).send("New password cannot be old password!");
  }

  // sifriraj go noviot password pred da go zapises vo databazata
  const newPasswordHashed = bcrypt.hashSync(newPassword);

  const userPasswordChanged = await setNewPassword(
    account._id.toString(),
    newPasswordHashed
  );
  console.log("userPass", userPasswordChanged);

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
  // try {
  //   const userId = req.params.id;
  //   if (!mongoose.Types.ObjectId.isValid(userId)) {
  //     console.log("Invalid user ID:", userId);
  //     return res.status(400).send("Invalid user ID");
  //   }

  //   console.log(`Fetching user with ID: ${userId}`);
  //   const account = await getById(userId);
  //   if (!account) {
  //     console.log("User not found with ID:", userId);
  //     return res.status(404).send("User not found!");
  //   }

  //   console.log("User found:", account);
  //   res.status(200).send(account);
  // } catch (err) {
  //   console.error("Internal Server Error:", err);
  //   res.status(500).send("Internal Server Error");
  // }
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

const getCompanyAccomplishments = async (req, res) => {
  try {
    const companyAccomplishments = await Account.findOne(
      { _id: req.user.id, type: "startup" },
      "companyAccomplishments"
    );

    if (!companyAccomplishments) {
      return res
        .status(404)
        .json({ message: "Company accomplishments not found" });
    }

    res.status(200).json(companyAccomplishments.companyAccomplishments);
  } catch (err) {
    console.error("Error fetching company accomplishments:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getMentorAccomplishments = async (req, res) => {
  try {
    const mentorAccomplishments = await Account.findOne(
      { _id: req.user.id, type: "mentor" },
      "mentorAccomplishments"
    );

    if (!mentorAccomplishments) {
      return res
        .status(404)
        .json({ message: "Mentor accomplishments not found" });
    }

    res.status(200).json(mentorAccomplishments.mentorAccomplishments);
  } catch (err) {
    console.error("Error fetching mentor accomplishments:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getBestPerformingMentors = async (rew, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const mentors = await getAll({
      type: "mentor",
      "mentorAccomplishments.completedJobs": { $gt: 0 },
      updatedAt: { $gte: oneMonthAgo },
    });
    const sortedMentors = mentors
      .map((mentor) => ({
        ...mentor.toObject(),
        completedJobs: mentor.mentorAccomplishments.completedJobs,
      }))
      .sort((a, b) => b.completedJobs - a.completedJobs)
      .slice(0, 3);
    res.status(200).json(sortedMentors);
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
  getMentorAccomplishments,
  getCompanyAccomplishments,
  getBestPerformingMentors,
};
