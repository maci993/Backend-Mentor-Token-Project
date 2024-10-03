const fs = require("fs");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

console.log('Mailgun API Key:', process.env.MAILGUN_API_KEY);
console.log('Mailgun Domain:', process.env.MAILGUN_DOMAIN);

// mg.messages
//   .create("sandboxdomain", {
//     from: "marinastojanovic224@gmail.com",
//     to: "marinastojanovic224@gmail.com",
//     subject: "Hello",
//     text: "Testing some Mailgun awesomeness!",
//     html: "<h1>Testing some Mailgun awesomeness!</h1>",
//   })
//   .then((msg) => console.log(msg)) // logs response data
//   .catch((err) => console.log(err)); // logs any error

const config = require("../config");

const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY, 
    url: "https://api.mailgun.net/",
  });

const sendMail = async (to, type, data) => {
const mailTemplates = {
    PASSWORD_RESET: {
      title: "Your password reset link has been generated",
      template: "reset_password.html",
    },
    WELCOME: {
      title: "Welcome to our website",
      template: "welcome.html",
    },
  };

  console.log("to", to, type, data);
//   const mg = mailgun.client({
//     username: "api",
//     key: process.env.MAILGUN_API_KEY || '2a4662e13bb1a5b413ffc4d8097afd37-7a3af442-41dd0e3c',
//   });

  let title = mailTemplates[type].title;
  let templatePath = `${__dirname}/../../email_templates/${mailTemplates[type].template}`;
  let content = await readTemplate(templatePath);

  // ova doagja od forgot password handlerot
  const { user, link } = data;
  const userName = user.name || "User";
  const userNameParts = userName.split(" ");
  const firstName = userNameParts[0]; 
  const lastName = userNameParts[1]; 

  let regexName = new RegExp(`\{\{first_name\}\}`, "g");
  let regexSurname = new RegExp(`\{\{last_name\}\}`, "g");
  let regexLink = new RegExp(`\{\{link\}\}`, "g");
  content = content.replace(regexName, firstName); 
  content = content.replace(regexSurname, lastName);
  content = content.replace(regexLink, link); 

  let options = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: title,
    html: content, 
  };

  try {
    const res = await mg.messages.create(process.env.MAILGUN_DOMAIN, options);
    console.log("Email SENT", res);
    return res;
  } catch (err) {
    console.log("Error Sending Email", err);
    throw err;
  }
};

const readTemplate = async (file) => {
  return new Promise((success, fail) => {
    fs.readFile(file, "utf-8", (err, data) => {
      if (err) return fail(err);
      return success(data);
    });
  });
};

module.exports = {
  sendMail,
};