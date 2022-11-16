# Hermes

Hermes is an [express](https://expressjs.com/) backend that is meant to receive and respond to requests with Athena and the database. 


## Important Note
Hermes will need to be run - **at the same time** - with the client code to be able to function. In this case, Athena (our front-end and client repository) will be run together with Hermes.

## Getting Started

To run Hermes, simply follow the instructions below:
1. Install the necessary packages by typing the following command
  ```
  npm i
  ```
  
2. Run the app with a client server
  ```
  npm run dev
  ```
  
3. Once you run the code above, your CLI should show you the following
  ```
  ...
  [nodemon] 2.0.20
  [nodemon] to restart at any time, enter `rs`
  [nodemon] watching path(s): *.*
  [nodemon] watching extensions: js,mjs,json
  [nodemon] starting `node server.js`
  listening on port http://localhost:8080
  ```
  This means the server is now running on your localhost and is now active.
