import express from "express";
import bodyParser from "body-parser";
import { ApiCore } from "./src/api/utilities/core.js";
import cors from "cors";
import dotenv from "dotenv";
import * as database from "./src/db/db.js"
dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.get("/test", (req, res) => {
    res.send("working");
});

app.post("/api/simplify", (req, res) => {
    // AUTH IS MISSING

    //   if (req.body.key == process.env.INTERNAL_KEY) {
    const textData = req.body;

    const apiCore = new ApiCore({
        getSimplify: true,
        textData: textData,
    });

    apiCore
        .simplifiedResponse()
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
        });
    //   }
});

app.post("/api/summarize", (req, res) => {
    // AUTH IS MISSING

    //   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    //   if (req.body.key == process.env.INTERNAL_KEY) {
    const textData = req.body;

    const apiCore = new ApiCore({
        getSummarize: true,
        textData: textData,
    });

    apiCore
        .summarizedResponse()
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
        });
    //   }
});

app.post("/api/dictionary", (req, res) => {
    // AUTH IS MISSING

    //   res.header("Access-Control-Allow-Origin", "http://localhost:3000");

    //   if (req.body.key == process.env.INTERNAL_KEY) {
    const textData = req.body;

    const apiCore = new ApiCore({
        getDictionary: true,
        textData: textData,
    });

    apiCore
        .dictionaryResponse()
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
        });
    //   }
});

// Database Routes

// User Routes

// TESTED - Laurent
app.post("/api/db/user/login", async (req, res) => {
    // AUTH IS MISSING
    if (!req.body) {
        res.status(400).send({ error: "all data is missing" })
        return
    }
    const userData = req.body.userData
    if (!userData) {
        res.status(400).send({ error: "user data is missing" })
        return
    }
    const user = await database.getUserByLogin(userData)
    res.status(200).send(user)
    return
});

// TESTED - Laurent
app.get("/api/db/user/:id", async (req, res) => {
    // AUTH IS MISSING
    if (!req.params) {
        res.status(400).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    const user = await database.getUserByID(id)
    if (!user) {
        res.status(404).send({ error: "There is no user with this id" })
        return
    }
    res.status(200).send(user)
    return
});

// TESTED - Laurent
app.post("/api/db/user", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "all data is missing" })
        return
    }
    const userData = req.body.userData
    if (!userData) {
        res.status(400).send({ error: "user data is missing" })
        return
    }
    const settingData = req.body.settingData
    if (!settingData) {
        res.status(400).send({ error: "setting data is missing" })
        return
    }
    const folderData = req.body.folderData
    if (!folderData) {
        res.status(400).send({ error: "folder data is missing" })
        return
    }
    const matches = await database.checkEmail(userData.userEmail)
    if (matches.user_matches !== 0) {
        res.status(400).send({ error: "user with email already exists" })
        return
    }
    const setting = await database.addSetting(settingData)
    userData.settingId = setting.setting_id
    console.log("new userData", userData)
    const user = await database.addUser(userData)
    folderData.userId = user.user_id
    console.log("new user folderData", folderData)
    await database.addFolder(folderData)
    res.status(200).send(user)
    return
});

// TESTED - Laurent
app.put("/api/db/user/email", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "user data is missing" })
        return
    }
    const userData = req.body.userData
    if (!userData.userId) {
        res.status(400).send({ error: "userId is missing" })
        return
    }
    if (!userData.userEmail) {
        res.status(400).send({ error: "userEmail is missing" })
        return
    }
    const user = await database.updateUserEmail(userData)
    res.status(200).send(user)
    return
});

// TESTED - Laurent
app.put("/api/db/user/username", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "user data is missing" })
        return
    }
    const userData = req.body.userData
    if (!userData.userId) {
        res.status(400).send({ error: "userId is missing" })
        return
    }
    if (!userData.userName) {
        res.status(400).send({ error: "userName is missing" })
        return
    }
    const user = await database.updateUserName(userData)
    res.status(200).send(user)
    return
});

// TESTED - Laurent
app.delete("/api/db/user/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    await database.deleteUser(id)
    res.status(200).end()
    return

})

// Setting Routes

// TESTED - Laurent
app.get("/api/db/setting/:id", async (req, res) => {
    // AUTH IS MISSING
    if (!req.params) {
        res.status(400).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    const setting = await database.getSettingByID(id)
    if (!setting) {
        res.status(404).send({ error: "There is no setting with this id" })
        return
    }
    res.status(200).send(setting)
    return
});

// TESTED - Laurent
app.get("/api/db/setting/userid/:userid", async (req, res) => {
    // AUTH IS MISSING
    if (!req.params) {
        res.status(400).send({ error: "userid info is missing" })
        return
    }
    const userId = +req.params.userid
    if (Number.isNaN(userId) || userId == null) {
        res.status(400).send({ error: "userid type is incorrect" })
        return
    }
    const setting = await database.getSettingByUserID(userId)
    if (!setting) {
        res.status(404).send({ error: "There is no setting with this userid" })
        return
    }
    res.status(200).send(setting)
    return
});

// TESTED - Laurent
app.get("/api/db/setting/fileid/:fileid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "fileid info is missing" })
        return
    }
    const fileId = +req.params.fileid
    if (Number.isNaN(fileId) || fileId == null) {
        res.status(400).send({ error: "fileid variable type is wrong" })
        return
    }
    const setting = await database.getSettingByFileID(fileId)
    if (!setting) {
        res.status(404).send({ error: "There is no setting with this fileid" })
        return
    }
    res.status(200).send(setting)
    return
});

// TESTED - Laurent (might be unnecessary, probably wont be used)
app.post("/api/db/setting", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "all data is missing" })
        return
    }
    const settingData = req.body.settingData
    if (!settingData) {
        res.status(400).send({ error: "setting data is missing" })
        return
    }
    const setting = await database.addSetting(settingData)
    res.status(200).send(setting)
    return
});

// TESTED - Laurent
app.put("/api/db/setting", async (req, res) => {
    // AUTH REQUIRED
    console.log("What is this", req.body)
    if (!req.body) {
        res.status(400).send({ error: "setting data is missing" })
        return
    }
    const settingData = req.body.settingData
    if (!settingData.settingId) {
        res.status(400).send({ error: "settingId is missing" })
        return
    }
    if (!settingData.backgroundColour) {
        res.status(400).send({ error: "backgroundColour is missing" })
        return
    }
    if (!settingData.typeface) {
        res.status(400).send({ error: "typeface is missing" })
        return
    }
    if (!settingData.fontSize) {
        res.status(400).send({ error: "fontSize is missing" })
        return
    }
    if (!settingData.lineSpace) {
        res.status(400).send({ error: "lineSpace is missing" })
        return
    }
    if (!settingData.letterSpace) {
        res.status(400).send({ error: "letterSpace is missing" })
        return
    }
    const setting = await database.updateSetting(settingData)
    res.status(200).send(setting)
    return
})

// TESTED - Laurent
app.delete("/api/db/setting/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    await database.deleteSetting(id)
    res.status(200).end()
    return

})

// Folder Routes

// TESTED - Laurent
app.get("/api/db/folder/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    const folder = await database.getFolderByID(id)
    if (!folder) {
        res.status(404).send({ error: "There is no folder with this id" })
        return
    }
    res.status(200).send(folder)
    return
});

// TESTED - Laurent
app.get("/api/db/folder/fileid/:fileid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "fileId info is missing" })
        return
    }
    const fileId = +req.params.fileid
    if (Number.isNaN(fileId) || fileId == null) {
        res.status(400).send({ error: "fileId type is incorrect" })
        return
    }
    const folder = await database.getFolderByFileID(fileId)
    if (!folder) {
        res.status(404).send({ error: "There is no folder with this fileid" })
        return
    }
    res.status(200).send(folder)
    return
});

// TESTED - Laurent
app.get("/api/db/folders/userid/:userid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "userId info is missing" })
        return
    }
    const userId = +req.params.userid
    if (Number.isNaN(userId) || userId == null) {
        res.status(400).send({ error: "userId type is incorrect" })
        return
    }
    const folders = await database.getFoldersByUserID(userId)
    if (!folders) {
        res.status(404).send({ error: "There are no folders with this userid" })
        return
    }
    res.status(200).send(folders)
    return
});

// TESTED - Laurent
app.post("/api/db/folder", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "all data is missing" })
        return
    }
    const folderData = req.body.folderData
    if (!folderData) {
        res.status(400).send({ error: "folder data is missing" })
        return
    }
    const folder = await database.addFolder(folderData)
    res.status(200).send(folder)
    return
});

// TESTED - Laurent
app.put("/api/db/folder", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "folder data is missing" })
        return
    }
    const folderData = req.body.folderData
    if (!folderData.folderId) {
        res.status(400).send({ error: "folderId is missing" })
        return
    }
    if (!folderData.folderName) {
        res.status(400).send({ error: "folderName is missing" })
        return
    }
    const folder = await database.updateFolder(folderData)
    res.status(200).send(folder)
    return
})

// TESTED - Laurent
app.delete("/api/db/folder/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "folderId info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "folderId type is incorrect" })
        return
    }
    await database.deleteFolder(id)
    res.status(200).end()
    return

})

// TESTED - Laurent
app.delete("/api/db/folders/userid/:userid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const userId = +req.params.userid
    if (Number.isNaN(userId) || userId == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    await database.deleteFoldersByUserId(userId)
    res.status(200).end()
    return

})

// File Routes

// TESTED - Laurent
app.get("/api/db/file/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    const file = await database.getFileByID(id)
    if (!file) {
        res.status(404).send({ error: "There is no file with this id" })
        return
    }
    const setting = await database.getSettingByFileID(file.file_id)
    if (!setting) {
        res.status(404).send({ error: "There is no setting with this file id" })
        return
    }
    const fileInfo = {
        fileData: file,
        settingData: setting
    }
    res.status(200).send(fileInfo)
    return
});

// TESTED - Laurent
app.get("/api/db/files/folderid/:folderid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "folderId info is missing" })
        return
    }
    const folderId = +req.params.folderid
    if (Number.isNaN(folderId) || folderId == null) {
        res.status(400).send({ error: "folderId type is incorrect" })
        return
    }
    const files = await database.getFileNamesByFolderID(folderId)
    if (!files) {
        res.status(404).send({ error: "There are no files with this folderid" })
        return
    }
    res.status(200).send(files)
    return
});

// TESTED - Laurent
app.get("/api/db/files/userid/:userid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "userId info is missing" })
        return
    }
    const userId = +req.params.userid
    if (Number.isNaN(userId) || userId == null) {
        res.status(400).send({ error: "userId type is incorrect" })
        return
    }
    const files = await database.getFileNamesByUserID(userId)
    if (!files) {
        res.status(404).send({ error: "There are no files with this userid" })
        return
    }
    res.status(200).send(files)
    return
});

// TESTED - Laurent
app.post("/api/db/file", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "all data is missing" })
        return
    }
    const fileData = req.body.fileData
    if (!fileData) {
        res.status(400).send({ error: "file data is missing" })
        return
    }
    const settingData = req.body.settingData
    if (!settingData) {
        res.status(400).send({ error: "setting data is missing" })
        return
    }
    if (!fileData.folderId) {
        const folders = await database.getFoldersByUserID(fileData.userId)
        fileData.folderId = folders[0].folder_id
    }
    const setting = await database.addSetting(settingData)
    fileData.settingId = setting.setting_id
    const file = await database.addFile(fileData)
    const fileInfo = {
        fileData: file,
        settingData: setting
    }
    res.status(200).send(fileInfo)
    return
});

// TESTED - Laurent
app.put("/api/db/file", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "file data is missing" })
        return
    }
    const fileData = req.body.fileData
    if (!fileData.fileId) {
        res.status(400).send({ error: "fileId is missing" })
        return
    }
    if (!fileData.fileName) {
        res.status(400).send({ error: "fileName is missing" })
        return
    }
    if (!fileData.folderId) {
        res.status(400).send({ error: "folderId is missing" })
        return
    }
    if (!fileData.fileContent) {
        res.status(400).send({ error: "folderId is missing" })
        return
    }
    const file = await database.updateFile(fileData)
    res.status(200).send(file)
    return
})

// TESTED - Laurent
app.delete("/api/db/file/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    await database.deleteFile(id)
    res.status(200).end()
    return

})

// TESTED - Laurent
app.delete("/api/db/files/folderid/:folderid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const folderId = +req.params.folderid
    if (Number.isNaN(folderId) || folderId == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    await database.deleteFilesByFolderId(folderId)
    res.status(200).end()
    return

})

// Image Routes

// ALL IMAGE ROUTES NEED TO GET TESTED

app.get("/api/db/image/id/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    const image = await database.getImageByID(id)
    if (!image) {
        res.status(404).send({ error: "There is no image with this id" })
        return
    }
    res.status(200).send(image)
    return
});

app.get("/api/db/images/fileid/:fileid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "fileId info is missing" })
        return
    }
    const fileId = +req.params.fileid
    if (Number.isNaN(fileId) || fileId == null) {
        res.status(400).send({ error: "fileId type is incorrect" })
        return
    }
    const images = await database.getImagesByFileID(folderid)
    if (!images) {
        res.status(404).send({ error: "There are no images with this folderid" })
        return
    }
    res.status(200).send(images)
    return
});

app.get("/api/db/images/userid/:userid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "userId info is missing" })
        return
    }
    const userId = +req.params.userid
    if (Number.isNaN(userId) || userId == null) {
        res.status(400).send({ error: "userId type is incorrect" })
        return
    }
    const images = await database.getImagesByUserID(userId)
    if (!images) {
        res.status(404).send({ error: "There are no images with this userid" })
        return
    }
    res.status(200).send(images)
    return
});

app.post("/api/db/image", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "all data is missing" })
        return
    }
    const imageData = req.body.imageData
    if (!imageData) {
        res.status(400).send({ error: "image data is missing" })
        return
    }
    const image = await database.addImage(imageData)
    res.status(200).send(image)
    return
});

app.put("/api/db/image", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "image data is missing" })
        return
    }
    const imageData = req.body.imageData
    if (!imageData.imageId) {
        res.status(400).send({ error: "imageId is missing" })
        return
    }
    if (!imageData.imageLink) {
        res.status(400).send({ error: "imageLink is missing" })
        return
    }
    if (!imageData.imageAltText) {
        res.status(400).send({ error: "imageAltText is missing" })
        return
    }
    const image = await database.updateImage(imageData)
    res.status(200).send(image)
    return
})

app.delete("/api/db/image/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    await database.deleteImage(id)
    res.status(200).end()
    return

})

app.delete("/api/db/images/fileid/:fileid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const fileId = +req.params.fileid
    if (Number.isNaN(fileId) || fileId == null) {
        res.status(400).send({ error: "fileId type is incorrect" })
        return
    }
    await database.deleteImagesByFileId(fileId)
    res.status(200).end()
    return
})

// Keyword Routes

app.get("/api/db/keyword/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    const keyword = await database.getKeywordByID(id)
    if (!keyword) {
        res.status(404).send({ error: "There is no keyword with this id" })
        return
    }
    res.status(200).send(keyword)
    return
});

app.get("/api/db/keywords/fileid/:fileid", async (req, res) => {
    // AUTH REQUIRED

    if (!req.params) {
        res.status(400).send({ error: "fileId info is missing" })
        return
    }
    const fileId = +req.params.fileid
    if (Number.isNaN(fileId) || fileId == null) {

        res.status(400).send({ error: "fileId type is incorrect" })
        return
    }
    const keywords = await database.getKeywordsByFileID(fileId)
    if (!keywords) {
        res.status(404).send({ error: "There are no keywords with this folderid" })
        return
    }
    res.status(200).send(keywords)
    return
});

app.post("/api/db/keyword", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "all data is missing" })
        return
    }
    const keywordData = req.body.keywordData
    if (!keywordData) {
        res.status(400).send({ error: "keyword data is missing" })
        return
    }
    const keyword = await database.addKeyword(keywordData)
    res.status(200).send(keyword)
    return
});

app.put("/api/db/keyword", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "keyword data is missing" })
        return
    }
    const keywordData = req.body.keywordData
    if (!keywordData.keywordId) {
        res.status(400).send({ error: "keywordId is missing" })
        return
    }
    if (!keywordData.keywordName) {
        res.status(400).send({ error: "keyword is missing" })
        return
    }
    if (!keywordData.keywordDefinition) {
        res.status(400).send({ error: "keyword is missing" })
        return
    }
    const keyword = await database.updateKeyword(keywordData)
    res.status(200).send(keyword)
    return
})

app.delete("/api/db/keyword/:id", async (req, res) => {
    // AUTH REQUIRED

    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    await database.deleteKeyword(id)
    res.status(200).end()
    return
})

// Summary Routes

app.get("/api/db/summary/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    const summary = await database.getSummaryByID(id)
    if (!summary) {
        res.status(404).send({ error: "There is no summary with this id" })
        return
    }
    res.status(200).send(summary)
    return
});

app.get("/api/db/summaries/fileid/:fileid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "fileId info is missing" })
        return
    }
    const fileId = +req.params.fileid
    if (Number.isNaN(fileId) || fileId == null) {
        res.status(400).send({ error: "fileId type is incorrect" })
        return
    }
    const summaries = await database.getSummariesByFileID(fileId)
    if (!summaries) {
        res.status(404).send({ error: "There are no summaries with this fileid" })
        return
    }
    res.status(200).send(summaries)
    return
});

app.post("/api/db/summary", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "all data is missing" })
        return
    }
    const summaryData = req.body.summaryData
    if (!summaryData) {
        res.status(400).send({ error: "summary data is missing" })
        return
    }
    const summary = await database.addSummary(summaryData)
    res.status(200).send(summary)
    return
});

app.put("/api/db/summary", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "summary data is missing" })
        return
    }
    const summaryData = req.body.summaryData
    if (!summaryData.summaryId) {
        res.status(400).send({ error: "summaryId is missing" })
        return
    }
    if (!summaryData.summaryName) {
        res.status(400).send({ error: "summary is missing" })
        return
    }
    if (!summaryData.summaryDefinition) {
        res.status(400).send({ error: "summary is missing" })
        return
    }
    const summary = await database.updateSummary(summaryData)
    res.status(200).send(summary)
    return
})

app.delete("/api/db/summary/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    await database.deleteSummary(id)
    res.status(200).end()
    return
})

// Highlight Routes

app.get("/api/db/highlight/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "id info is missing" })
        return
    }
    const id = +req.params.id
    if (Number.isNaN(id) || id == null) {
        res.status(400).send({ error: "id type is incorrect" })
        return
    }
    const highlight = await database.getHighlightByID(id)
    if (!highlight) {
        res.status(404).send({ error: "There is no highlight with this id" })
        return
    }
    res.status(200).send(highlight)
    return
});

app.get("/api/db/highlights/fileid/:fileid", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(400).send({ error: "fileId info is missing" })
        return
    }
    const fileId = +req.params.fileid
    if (Number.isNaN(fileId) || fileId == null) {
        res.status(400).send({ error: "fileId type is incorrect" })
        return
    }
    const highlights = await database.getHighlightsByFileID(fileId)
    if (!highlights) {
        res.status(404).send({ error: "There are no highlights with this fileid" })
        return
    }
    res.status(200).send(highlights)
    return
});

app.post("/api/db/highlight", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "highlight data is missing" })
        return
    }
    const highlightData = req.body.highlightData
    if (!highlightData.highlightId) {
        res.status(400).send({ error: "highlightId is missing" })
        return
    }
    if (!highlightData.fileId) {
        res.status(400).send({ error: "fileId is missing" })
        return
    }
    const highlight = await database.addHighlight(highlightData)
    res.status(200).send(highlight)
    return
});

app.put("/api/db/highlight", async (req, res) => {
    // AUTH REQUIRED
    if (!req.body) {
        res.status(400).send({ error: "highlight data is missing" })
        return
    }
    const highlightData = req.body.highlightData
    if (!highlightData.highlightId) {
        res.status(400).send({ error: "highlightId is missing" })
        return
    }
    if (!highlightData.fileId) {
        res.status(400).send({ error: "fileId is missing" })
        return
    }
    const highlight = await database.updateHighlight(highlightData)
    res.status(200).send(highlight)
    return
});

app.delete("/api/db/highlight/:id", async (req, res) => {
    // AUTH REQUIRED
    if (!req.params) {
        res.status(404).send({ error: "id info is missing" })
        return
    }
    const id = req.params.id
    await database.deleteHighlight(id)
    res.status(200).end()
    return
});

// App Listen

const port = process.env.PORT || 8080;
app.listen(port, () =>
    console.log(`listening on port http://localhost:${port}`)
);
