// provider.js

// Defines how axios or any api library should connect with
// the database and connect our response data back
// to any connected file or component

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { handleResponse, handleError } from "./response.js";
import FormData from "form-data";

/** @param {string} textData */
const getSimplify = async (textData) => {
  const apiBody = {
    prompt: textData.text,
    numResults: 1,
    MaxTokens: 2480,
    temperature: 0,
    topKReturn: 0,
    topP: 1,
    stopSequences: ["."],
  };

  try {
    const response = await axios.post(
      "https://api.ai21.com/studio/v1/j1-jumbo/complete",
      apiBody,
      {
        headers: {
          Authorization: process.env.SIMPLIFY_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/** @param {string} textData */
const getSummarize = async (textData) => {
  try {
    // Meaning cloud API
    const formdata = new FormData();
    formdata.append("key", process.env.SUMMARIZE_KEY);
    formdata.append("txt", textData.text);
    formdata.append("sentences", "2");

    const response = await axios({
      method: "post",
      url: "https://api.meaningcloud.com/summarization-1.0",
      data: formdata,
    });

    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/** @param {string} textData */
const getDictionary = async (textData) => {
  // axios API call here
  try {
    const options = await axios({
      method: "GET",
      url: `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${textData.word}`,
      params: { key: process.env.DICTIONARY_KEY },
    });
    return handleResponse(options);
  } catch (error) {
    return handleError(error);
  }
};

export const apiProvider = {
  getSimplify,
  getSummarize,
  getDictionary,
};
