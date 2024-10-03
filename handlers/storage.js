const fs = require("fs");
const makeId = require("../pkg/strings");

const MAX_FILESIZE = 1048576; //1mb
const ALLOWED_FILETYPES = [
  "image/jpeg",
  "image/png",
  "image/pjpeg",
  "image/gif",
];

const upload = async (req, res) => {
  console.log("files", req.files);

  try {
    if (!req.files || !req.files.document) {
      return res.status(400).send("No file uploaded.");
    }

    const file = req.files.document;

    // Validate file size
    if (MAX_FILESIZE < file.size) {
      return res.status(400).send("File exceeds max file size!");
    }

    // Validate file type
    if (!ALLOWED_FILETYPES.includes(file.mimetype)) {
      return res.status(400).send("Invalid file type.");
    }

    const fileName = `${makeId(6)}_${file.name}`;
    const userDir = `user_${req.auth ? req.auth.id : "guest"}`;
    // const uploadDir = `${__dirname}/../uploads`;
    // const filePath = `${uploadDir}/${fileName}`;
    const userDirPath = `${__dirname}/../uploads/${userDir}`;

    if (!fs.existsSync(userDirPath)) {
      fs.mkdirSync(userDirPath, { recursive: true });
    }

    const filePath = `${userDirPath}/${fileName}`;

//move file
    file.mv(filePath, (err) => {
      if (err) {
        return res.status(500).send("Internal Server Error: Could not upload file.");
      }
      return res.status(201).send({ file_name: fileName, file_path: filePath });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error.");
  }
};


const removeFiles = async (req, res) => {
    const { fileName } = req.params;
    const filePath = `${__dirname}/../uploads/${fileName}`;

    try {
        if (!fs.existsSync(filePath)) {
          return res.status(404).send("File Not Found!");
        }
    
        fs.unlink(filePath, (err) => {
          if (err) {
            return res.status(500).send("Error deleting file.");
          }
          res.status(200).send("File deleted successfully!");
        });
      } catch (error) {
        return res.status(500).send("Internal Server Error.");
      }
    };
  

module.exports = {
  upload,
  removeFiles,
};
