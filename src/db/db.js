import mysql from "mysql2"
import dotenv from "dotenv"
dotenv.config()
import bcrypt from 'bcrypt'

const database = mysql
    .createPool({
        host: process.env.DBHOST,
        port: process.env.DBPORT,
        user: process.env.DBUSER,
        password: process.env.DBPASSWORD,
        database: process.env.DBDATABASE,
        multipleStatements: false,
        namedPlaceholders: true
    })
    .promise()


// USERS //

// TESTED - Laurent
export async function getUserByLogin(dbData) {
    const userEmail = dbData.userEmail
    const password = dbData.password
    const params = {
        user_email: userEmail,
    }
    const sqlSelectUserByEmail = "SELECT user.user_id, user.user_email, user.user_name, user.password_hash, setting.setting_id, setting.background_colour, setting.typeface, setting.font_size, setting.line_space, setting.letter_space FROM user LEFT JOIN setting ON setting.setting_id = user.setting_id WHERE user.user_email = :user_email;"
    const user_info = await database.query(sqlSelectUserByEmail, params)
    if (user_info[0][0]) {
        const match = await bcrypt.compare(password, user_info[0][0].password_hash)
        if (match) {
            console.log('DB user login', user_info[0][0])
            return user_info[0][0]
        }
    }
}

// TESTED - Laurent
export async function getUserByID(userId) {
    const params = {
        user_id: userId,
    }
    console.log(userId)
    const sqlSelectUserByID = "SELECT user.user_id, user.user_email, user.user_name, user.password_hash, setting.setting_id, setting.background_colour, setting.typeface, setting.font_size, setting.line_space, setting.letter_space FROM user LEFT JOIN setting ON setting.setting_id = user.setting_id WHERE user.user_id = :user_id;"
    const user_info = await database.query(sqlSelectUserByID, params)
    console.log('db get user by id', user_info[0][0])
    return user_info[0][0]
}

// TESTED - Laurent
export async function addUser(dbData) {
    const checkUserResult = await checkEmail(dbData.userEmail)
    if (checkUserResult.user_matches === 0) {
        const password = dbData.password
        const encryptedPassword = await bcrypt.hash(password, 10)
        const params = {
            setting_id: dbData.settingId,
            user_name: dbData.userName,
            user_email: dbData.userEmail,
            password: encryptedPassword,
        }
        const sqlInsertUser = "INSERT INTO user (user_name, setting_id, user_email, password_hash, user_creation_date) VALUES (:user_name, :setting_id, :user_email, :password, CURRENT_TIMESTAMP);"
        const result = await database.query(sqlInsertUser, params)
        if (result[0]) {
            const user_info = await getUserByID(result[0].insertId)
            console.log('db add user', user_info)
            return user_info
        }
        return
    }
    return
}

// TESTED - Laurent
export async function checkEmail(userEmail) {
    const params = {
        user_email: userEmail,
    }
    const sqlSelectUserByEmail = "SELECT COUNT(*) AS user_matches FROM user WHERE user_email = :user_email;"
    const user_matches = await database.query(sqlSelectUserByEmail, params)
    console.log('db check email', user_matches[0][0])
    return user_matches[0][0]
}

// TESTED - Laurent
export async function updateUserEmail(dbData) {
    const params = {
        user_id: dbData.userId,
        user_email: dbData.userEmail
    }
    const matches = await checkEmail(dbData.userEmail)
    if (matches.user_matches === 0) {
        const sqlUpdateUserEmail = "UPDATE user SET user_email = :user_email WHERE user_id = :user_id;"
        await database.query(sqlUpdateUserEmail, params)
        const user_info = await getUserByID(dbData.userId)
        return user_info
    }
    return
}

// TESTED - Laurent
export async function updateUserName(dbData) {
    const params = {
        user_id: dbData.userId,
        user_name: dbData.userName
    }
    const sqlUpdateUserName = "UPDATE user SET user_name = :user_name WHERE user_id = :user_id;"
    await database.query(sqlUpdateUserName, params)
    const user_info = await getUserByID(dbData.userId)
    return user_info
}

// TESTED - Laurent
export async function deleteUser(userId) {
    const params = {
        user_id: userId
    }
    const sqlDeleteUser = "DELETE FROM user WHERE user_id = :user_id;"
    const setting = await getSettingByUserID(userId)
    if (!setting) {
        return
    }
    await deleteFoldersByUserId(userId)
    await database.query(sqlDeleteUser, params)
    await deleteSetting(setting.setting_id)
    console.log('db user deleted')
    return
}

// SETTINGS //

// TESTED - Laurent
export async function getSettingByID(settingId) {
    const params = {
        setting_id: settingId,
    }

    const sqlSelectSettingByID = "SELECT setting.setting_id, setting.background_colour, setting.typeface, setting.font_size, setting.line_space, setting.letter_space FROM setting WHERE setting.setting_id = :setting_id;"
    const setting_info = await database.query(sqlSelectSettingByID, params)
    console.log('db get setting by id', setting_info[0][0])
    return setting_info[0][0]
}


export async function getSettingByFileID(fileId) {
    const params = {
        file_id: fileId,
    }

    const sqlSelectSettingByFileID = "SELECT setting.setting_id, setting.background_colour, setting.typeface, setting.font_size, setting.line_space, setting.letter_space FROM file JOIN setting ON setting.setting_id = file.setting_id WHERE file.file_id = :file_id;"
    const setting_info = await database.query(sqlSelectSettingByFileID, params)
    console.log('db get setting by file id', setting_info[0][0])
    return setting_info[0][0]
}

// TESTED - Laurent
export async function getSettingByUserID(userId) {
    const params = {
        user_id: userId,
    }

    const sqlSelectSettingByUserID = "SELECT setting.setting_id, setting.background_colour, setting.typeface, setting.font_size, setting.line_space, setting.letter_space FROM user JOIN setting ON setting.setting_id = user.setting_id WHERE user.user_id = :user_id;"
    const setting_info = await database.query(sqlSelectSettingByUserID, params)
    console.log('db get setting by user id', setting_info[0][0])
    return setting_info[0][0]
}

// TESTED - Laurent
export async function addSetting(dbData) {
    const params = {
        background_colour: dbData.backgroundColour,
        typeface: dbData.typeface,
        font_size: dbData.fontSize,
        line_space: dbData.lineSpace,
        letter_space: dbData.letterSpace
    }
    const sqlInsertSetting = "INSERT INTO setting (background_colour, typeface, font_size, line_space, letter_space) VALUES (:background_colour, :typeface, :font_size, :line_space, :letter_space);"
    const result = await database.query(sqlInsertSetting, params)
    if (result[0]) {
        const setting_info = await getSettingByID(result[0].insertId)
        console.log('db add setting', setting_info)
        return setting_info
    }
}

// TESTED - Laurent
export async function updateSetting(dbData) {
    const params = {
        setting_id: dbData.settingId,
        background_colour: dbData.backgroundColour,
        typeface: dbData.typeface,
        font_size: dbData.fontSize,
        line_space: dbData.lineSpace,
        letter_space: dbData.letterSpace
    }
    const sqlUpdateSetting = "UPDATE setting SET background_colour = :background_colour, typeface = :typeface, font_size = :font_size, line_space = :line_space, letter_space = :letter_space WHERE setting.setting_id = :setting_id;"
    await database.query(sqlUpdateSetting, params)
    const setting_info = await getSettingByID(dbData.settingId)
    console.log('db update setting', setting_info)
    return setting_info
}

// TESTED - Laurent
export async function deleteSetting(settingId) {
    const params = {
        setting_id: settingId
    }
    const sqlDeleteSetting = "DELETE FROM setting WHERE setting_id = :setting_id;"
    await database.query(sqlDeleteSetting, params)
    console.log('db setting deleted')
    return
}

// FOLDERS //

// TESTED - Laurent
export async function getFolderByID(folderId) {
    const params = {
        folder_id: folderId,
    }

    const sqlSelectFolderByID = "SELECT folder.folder_id, folder.user_id, folder.folder_name FROM folder WHERE folder.folder_id = :folder_id;"
    const folder_info = await database.query(sqlSelectFolderByID, params)
    console.log('db get folder by id', folder_info[0][0])
    return folder_info[0][0]
}

export async function getFolderByFileID(fileId) {
    const params = {
        file_id: fileId,
    }

    const sqlSelectFolderByFileID = "SELECT folder.folder_id, folder.user_id, folder.folder_name FROM file JOIN folder ON folder.folder_id = file.folder_id WHERE file.file_id = :file_id;"
    const folder_info = await database.query(sqlSelectFolderByFileID, params)
    console.log('db get folder by file id', folder_info[0][0])
    return folder_info[0][0]
}

// TESTED - Laurent
export async function getFoldersByUserID(userId) {
    const params = {
        user_id: userId,
    }

    const sqlSelectFolderByUserID = "SELECT folder.folder_id, folder.user_id, folder.folder_name FROM user JOIN folder ON folder.user_id = user.user_id WHERE user.user_id = :user_id;"
    const all_folder_info = await database.query(sqlSelectFolderByUserID, params)
    console.log('db get folder by user id', all_folder_info[0])
    return all_folder_info[0]
}

// TESTED - Laurent
export async function addFolder(dbData) {
    const checkFolderResult = await checkFolder(dbData.userId, dbData.folderName)
    if (checkFolderResult.folder_matches === 0) {
        const params = {
            user_id: dbData.userId,
            folder_name: dbData.folderName
        }
        const sqlInsertFolder = "INSERT INTO folder (folder_name, user_id) VALUES (:folder_name, :user_id);"
        const result = await database.query(sqlInsertFolder, params)
        if (result[0]) {
            const folder_info = await getFolderByID(result[0].insertId)
            console.log('db add folder', folder_info)
            return folder_info
        }
        return
    }
    return
}

// TESTED - Laurent (maybe a bad design?)
export async function checkFolder(userId, folderName) {
    const params = {
        user_id: userId,
        folder_name: folderName
    }
    const sqlSelectFolderByName = "SELECT COUNT(*) AS folder_matches FROM folder JOIN user ON user.user_id = folder.user_id WHERE folder.folder_name = :folder_name AND user.user_id = :user_id;"
    const folder_matches = await database.query(sqlSelectFolderByName, params)
    console.log('db check folder names', folder_matches[0][0])
    return folder_matches[0][0]
}

// TESTED - Laurent
export async function updateFolder(dbData) {
    const checkFolderResult = await checkFolder(dbData.userId, dbData.folderName)
    if (checkFolderResult.folder_matches === 0) {
        const params = {
            folder_id: dbData.folderId,
            folder_name: dbData.folderName
        }
        const sqlUpdateFolder = "UPDATE folder SET folder_name = :folder_name WHERE folder_id = :folder_id;"
        await database.query(sqlUpdateFolder, params)
        const folder_info = await getFolderByID(dbData.folderId)
        console.log('db update folder', folder_info)
        return folder_info
    }
    return
}

// TESTED - Laurent
export async function deleteFolder(folderId) {
    const params = {
        folder_id: folderId
    }
    const sqlDeleteFolder = "DELETE FROM folder WHERE folder_id = :folder_id;"
    await deleteFilesByFolderId(folderId)
    await database.query(sqlDeleteFolder, params)
    console.log('db folder deleted')
    return
}

// TESTED - Laurent
export async function deleteFoldersByUserId(userId) {
    const folders = await getFoldersByUserID(userId)
    if (folders.length >= 1) {
        for (const folder of folders) {
            await deleteFolder(folder.folder_id)
        }
    }
    console.log('db folders from user deleted')
    return
}

// FILES //

// TESTED - Laurent
export async function getFileByID(fileId) {
    const params = {
        file_id: fileId,
    }
    const sqlSelectFileByID = "SELECT file.file_id, file.user_id, file.setting_id, file.folder_id, file.file_link, file.file_content, file.file_name, file.file_creation_date FROM file WHERE file.file_id = :file_id;"
    const file_info = await database.query(sqlSelectFileByID, params)
    console.log('db get file by id', file_info[0][0])
    const images = await getImagesByFileID(fileId)
    file_info[0][0].images = images
    return file_info[0][0]

}

// TESTED - Laurent
export async function getFileNamesByFolderID(folderId) {
    const params = {
        folder_id: folderId,
    }

    const sqlSelectFileNamesByFolderID = "SELECT file.file_id, file.file_name, file.file_content, file.folder_id FROM folder JOIN file ON file.folder_id = folder.folder_id WHERE folder.folder_id = :folder_id;"
    const all_file_info = await database.query(sqlSelectFileNamesByFolderID, params)
    console.log('db get file names by folder id', all_file_info[0])
    return all_file_info[0]
}

// TESTED - Laurent
export async function getFileNamesByUserID(userId) {
    const params = {
        user_id: userId,
    }

    const sqlSelectFileNamesByUserID = "SELECT file.file_id, file.file_name, file.file_content FROM user JOIN file ON file.user_id = user.user_id WHERE user.user_id = :user_id;"
    const all_file_info = await database.query(sqlSelectFileNamesByUserID, params)
    console.log('db get file names by user id', all_file_info[0])
    return all_file_info[0]
}

// TESTED - Laurent
export async function addFile(dbData) {
    const params = {
        user_id: dbData.userId,
        setting_id: dbData.settingId,
        folder_id: dbData.folderId,
        file_name: dbData.fileName,
        file_link: dbData.fileLink,
        file_content: dbData.fileContent,
    }
    const sqlInsertFile = "INSERT INTO file (user_id, setting_id, folder_id, file_name, file_link, file_content, file_creation_date) VALUES (:user_id, :setting_id, :folder_id, :file_name, :file_link, :file_content, CURRENT_TIMESTAMP);"
    const result = await database.query(sqlInsertFile, params)
    if (result[0]) {
        const file_info = await getFileByID(result[0].insertId)
        console.log('db add file', file_info)
        return file_info
    }
    return
}

// TESTED - Laurent
export async function updateFile(dbData) {
    const params = {
        file_id: dbData.fileId,
        file_name: dbData.fileName,
        file_content: dbData.fileContent,
        folder_id: dbData.folderId
    }
    const sqlUpdateFile = "UPDATE file SET file_name = :file_name, file_content = :file_content, folder_id = :folder_id WHERE file_id = :file_id;"
    await database.query(sqlUpdateFile, params)
    const file_info = await getFileByID(dbData.fileId)
    console.log('db rename file', file_info)
    return file_info
}

// TESTED - Laurent
export async function deleteFile(fileId) {
    const params = {
        file_id: fileId
    }
    const sqlDeleteFile = "DELETE FROM file WHERE file_id = :file_id;"
    const setting = await getSettingByFileID(fileId)
    if (!setting) {
        return
    }
    await deleteImagesByFileId(fileId)
    await deleteKeywordsByFileId(fileId)
    await deleteSummariesByFileId(fileId)
    await database.query(sqlDeleteFile, params)
    await deleteSetting(setting.setting_id)
    console.log('db file deleted')
    return
}

// TESTED - Laurent
export async function deleteFilesByFolderId(folderId) {
    const files = await getFileNamesByFolderID(folderId)
    if (files.length >= 1) {
        for (const file of files) {
            await deleteFile(file.file_id)
        }
    }
    console.log('db files from folder deleted')
    return
}

// IMAGES //

// ALL IMAGE QUERIES NEED TO GET TESTED

export async function getImageByID(imageId) {
    const params = {
        image_id: imageId,
    }

    const sqlSelectImageByID = "SELECT image.image_id, image.file_id, image.image_link, image.image_alt_text FROM image WHERE image.image_id = :image_id;"
    const image_info = await database.query(sqlSelectImageByID, params)
    console.log('db get image by id', image_info[0][0])
    return image_info[0][0]
}

export async function getImagesByFileID(fileId) {
    const params = {
        file_id: fileId,
    }

    const sqlSelectImagesByFileID = "SELECT image.image_id, image.file_id, image.image_link, image.image_alt_text FROM image WHERE image.file_id = :file_id;"
    const all_file_images = await database.query(sqlSelectImagesByFileID, params)
    console.log('db get images by file id', all_file_images[0])
    return all_file_images[0]
}

export async function getImagesByUserID(userId) {
    const params = {
        user_id: userId,
    }

    const sqlSelectFileNamesByUserID = "SELECT image.image_id, image.file_id, image.image_link, image.image_alt_text FROM image WHERE image.user_id = :user_id;"
    const all_file_info = await database.query(sqlSelectFileNamesByUserID, params)
    console.log('db get file names by user id', all_file_info[0])
    return all_file_info[0]
}

export async function addImage(dbData) {
    const params = {
        file_id: dbData.fileId,
        image_link: dbData.imageLink,
        image_alt_text: dbData.imageAltText,
    }
    const sqlInsertImage = "INSERT INTO image (file_id, image_link, image_alt_text) VALUES (:file_id, :image_link, :image_alt_text);"
    const file = await getFileByID(dbData.fileId)
    if (file) {
        const result = await database.query(sqlInsertImage, params)
        if (result[0]) {
            const image_info = await getImageByID(result[0].insertId)
            console.log('db add image', image_info)
            return image_info
        }
        return
    }
    return
}


export async function updateImage(dbData) {
    const params = {
        image_id: dbData.imageId,
        image_link: dbData.imageLink,
        image_alt_text: dbData.imageAltText,
    }
    const sqlUpdateImage = "UPDATE image SET image_link = :image_link, image_alt_text = :image_alt_text WHERE image_id = :image_id;"
    await database.query(sqlUpdateImage, params)
    const image_info = await getImageByID(dbData.fileId)
    console.log('db update image', image_info)
    return image_info
}


export async function deleteImage(imageId) {
    const params = {
        image_id: imageId
    }
    const sqlDeleteImage = "DELETE FROM image WHERE image_id = :image_id;"
    await database.query(sqlDeleteImage, params)
    console.log('db image deleted')
    return
}

export async function deleteImagesByFileId(fileId) {
    const params = {
        file_id: fileId
    }
    const sqlDeleteImage = "DELETE FROM image WHERE file_id = :file_id;"
    await database.query(sqlDeleteImage, params)
    console.log('db images from file deleted')
    return
}

// KEYWORDS //

export async function getKeywordByID(keywordId) {
    const params = {
        keyword_id: keywordId,
    }

    const sqlSelectKeyWordByID = "SELECT keyword.keyword_id, keyword.keyword_name, keyword.keyword_definition FROM keyword WHERE keyword.keyword_id = :keyword_id;"
    const keyword_info = await database.query(sqlSelectKeyWordByID, params)
    console.log('db get keyword by id', keyword_info[0][0])
    return keyword_info[0][0]
}

export async function getKeywordsByFileID(fileId) {
    const params = {
        file_id: fileId,
    }

    const sqlSelectKeyWordsByFileID = "SELECT keyword.keyword_id, keyword.keyword_name, keyword.keyword_definition FROM keyword WHERE keyword.file_id = :file_id;"
    const all_file_keywords = await database.query(sqlSelectKeyWordsByFileID, params)
    console.log('db get keywords by file id', all_file_keywords[0])
    return all_file_keywords[0]
}

export async function addKeyword(dbData) {
    const params = {
        file_id: dbData.fileId,
        keyword_name: dbData.keywordName,
        keyword_definition: dbData.keywordDefinition,
    }
    const sqlInsertKeyWord = "INSERT INTO keyword (file_id, keyword_name, keyword_definition) VALUES (:file_id, :keyword_name, :keyword_definition);"
    const file = await getFileByID(dbData.fileId)
    if (file) {
        const result = await database.query(sqlInsertKeyWord, params)
        if (result[0]) {
            const keyword_info = await getKeywordByID(result[0].insertId)
            console.log('db add keyword', keyword_info)
            return keyword_info
        }
        return
    }
    return
}

export async function updateKeyword(dbData) {
    const params = {
        keyword_id: dbData.keywordId,
        keyword_name: dbData.keywordName,
        keyword_definition: dbData.keywordDefinition,
    }
    const sqlUpdateKeyWord = "UPDATE keyword SET keyword_name = :keyword_name, keyword_definition = :keyword_definition WHERE keyword_id = :keyword_id;"
    await database.query(sqlUpdateKeyWord, params)
    const keyword_info = await getKeywordByID(dbData.keywordId)
    console.log('db update keyword', keyword_info)
    return keyword_info
}

export async function deleteKeyword(keywordId) {
    const params = {
        keyword_id: keywordId
    }
    const sqlDeleteKeyWord = "DELETE FROM keyword WHERE keyword_id = :keyword_id;"
    await database.query(sqlDeleteKeyWord, params)
    console.log('db keyword deleted')
    return
}

export async function deleteKeywordsByFileId(fileId) {
    const params = {
        file_id: fileId
    }
    const sqlDeleteKeyWord = "DELETE FROM keyword WHERE file_id = :file_id;"
    await database.query(sqlDeleteKeyWord, params)
    console.log('db keywords from file deleted')
    return
}

// SUMMARY //

export async function getSummaryByID(summaryId) {
    const params = {
        summary_id: summaryId,
    }
    const sqlSelectSummaryByID = "SELECT summary.summary_id, summary.file_id, summary.summary_content, summary.summary_result FROM summary WHERE summary.summary_id = :summary_id;"
    const summary_info = await database.query(sqlSelectSummaryByID, params)
    console.log('db get summary by id', summary_info[0][0])
    return summary_info[0][0]
}

export async function getSummariesByFileID(fileId) {
    const params = {
        file_id: fileId,
    }
    const sqlSelectSummariesByFileID = "SELECT summary.summary_id, summary.file_id, summary.summary_content, summary.summary_result FROM summary WHERE summary.file_id = :file_id;"
    const all_file_summaries = await database.query(sqlSelectSummariesByFileID, params)
    console.log('db get summaries by file id', all_file_summaries[0])
    return all_file_summaries[0]
}

export async function addSummary(dbData) {
    const params = {
        file_id: dbData.fileId,
        summary_content: dbData.summaryContent,
        summary_result: dbData.summaryResult,
    }
    const sqlInsertSummary = "INSERT INTO summary (file_id, summary_content, summary_result) VALUES (:file_id, :summary_content, :summary_result);"
    const file = await getFileByID(dbData.fileId)
    if (file) {
        const result = await database.query(sqlInsertSummary, params)
        if (result[0]) {
            const summary_info = await getSummaryByID(result[0].insertId)
            console.log('db add summary', summary_info)
            return summary_info
        }
        return
    }
    return
}

export async function updateSummary(dbData) {
    const params = {
        summary_id: dbData.summaryId,
        summary_content: dbData.summaryContent,
        summary_result: dbData.summaryResult,
    }
    const sqlUpdateSummary = "UPDATE summary SET summary_content = :summary_content, summary_result = :summary_result WHERE summary_id = :summary_id;"
    await database.query(sqlUpdateSummary, params)
    const summary_info = await getSummaryByID(dbData.summaryId)
    console.log('db update summary', summary_info)
    return summary_info
}

export async function deleteSummary(summaryId) {
    const params = {
        summary_id: summaryId
    }
    const sqlDeleteSummary = "DELETE FROM summary WHERE summary_id = :summary_id;"
    await database.query(sqlDeleteSummary, params)
    console.log('db summary deleted')
    return
}

export async function deleteSummariesByFileId(fileId) {
    const params = {
        file_id: fileId
    }
    const sqlDeleteSummary = "DELETE FROM summary WHERE file_id = :file_id;"
    await database.query(sqlDeleteSummary, params)
    console.log('db summaries from file deleted')
    return
}