const mongoose = require("mongoose");
const { getSection } = require("../config");

const { MONGO_USERNAME, MONGO_PASSWORD } = getSection("development");

const uri = `mongodb+srv://savicmarina993:macencedoll993@cluster0.6ic7awf.mongodb.net/Mentor_token?retryWrites=true&w=majority&appName=Cluster0`;

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected!");
  } catch (err) {
    console.error(err.message);
  }
}

connect();