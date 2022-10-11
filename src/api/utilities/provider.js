// ? provider.js
// ? Defines how axios or any api library should connect with
// ? the database and connect our response data back
// ? to any connected file or component

import axios from 'axios'
import { handleResponse, handleError } from './response.js'

// Define you api url from any source
// Pulling from your .env file when on the server or from localhost when locally

/** @param {string} textData */
const getSimplify = async (textData) => {

    const apiBody = {
        "prompt": textData.text,
        "numResults": 1,
        "MaxTokens": 2480,
        "temperature": 0,
        "topKReturn": 0,
        "topP":1,
        "stopSequences":["."]
      }


    try {
        const response = await axios.post("https://api.ai21.com/studio/v1/j1-jumbo/complete",
            apiBody,
            {
                headers: {
                    "Authorization": "Bearer IeOtRPMQtY84AiTQuc1CqWQjm7l9PDVq",
                    "Content-Type": "application/json"
                },
            })
        return handleResponse(response)
    } catch (error) {
        return handleError(error)
    }
       
}



export const apiProvider = {
    getSimplify
}