// response.js

// clean separation for any response and error logic you
// may want to handle here for all API calls

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

export function handleResponse(response){
    // console.log(response)
    if(response.data){
        return response.data
    }

    return response

}

export function handleError(error) {
    // console.log(error)
    if (error.data) {
      return error.data;
    }
    return error;
}