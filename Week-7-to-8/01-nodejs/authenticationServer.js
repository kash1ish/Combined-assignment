/**
  You need to create a HTTP server in Node.js which will handle the logic of an authentication server.
  - Don't need to use any database to store the data.

  - Save the users and their signup/login data in an array in a variable
  - You can store the passwords in plain text (as is) in the variable for now

  The expected API endpoints are defined below,
  1. POST /signup - User Signup
    Description: Allows users to create an account. This should be stored in an array on the server, and a unique id should be generated for every new user that is added.
    Request Body: JSON object with username, password, firstName and lastName fields.
    Response: 201 Created if successful, or 400 Bad Request if the username already exists.
    Example: POST http://localhost:3000/signup

  2. POST /login - User Login
    Description: Gets user back their details like firstname, lastname and id
    Request Body: JSON object with username and password fields.
    Response: 200 OK with an authentication token in JSON format if successful, or 401 Unauthorized if the credentials are invalid.
    Example: POST http://localhost:3000/login

  3. GET /data - Fetch all user's names and ids from the server (Protected route)
    Description: Gets details of all users like firstname, lastname and id in an array format. Returned object should have a key called users which contains the list of all users with their email/firstname/lastname.
    The users username and password should be fetched from the headers and checked before the array is returned
    Response: 200 OK with the protected data in JSON format if the username and password in headers are valid, or 401 Unauthorized if the username and password are missing or invalid.
    Example: GET http://localhost:3000/data

  - For any other route not defined in the server return 404

  Testing the server - run `npm run test-authenticationServer` command in terminal
*/

const express = require("express");
const app = express();

app.use(express.json());

const users = [];

app.post("/signup", (req,res)=>{
  try{
    const { email, username, password, firstName, lastName } = req.body;
    
    const existingUser = users.find((user)=> user.username == username);
    if(existingUser){
      return res.status(400).json({
        message: "Username already exists",
      })
    }
    const newUser = {
      id: Date.now(),
      email,
      username, 
      password,
      firstName, 
      lastName
    }
    users.push(newUser);
    console.log(users);
    res.status(201).send("Signup successful");
  }catch(error){
    res.status(500).json({
      message: error.message,
    })
  }
})

app.post("/login", (req, res)=>{
  try{
    const{ username, password } = req.body;
    
    const user = users.find(user => user.username === username);

    if(!user){
      return res.status(401).send("User doesn't exist");
    }

    const {email, firstName, lastName, id} = user;

    if(user.password !== password){
      return res.status(401).json("Invalid Credentials");
    }
    
    if(user){
      const token = Math.floor(Math.random() * 1000000000);
      return res.status(200).json({token, email, firstName, lastName, id})
    }
  }catch(error){
    return res.status(500).json({
      message: error.message,
    })
  }
})

app.get("/data", (req, res)=>{
  try{
    const email = req.headers.email;
    const password = req.headers.password;

    if(!email || !password){
      return res.status(401).send("Unauthorized");
    }
    const user = users.find((user)=> {
      return user.email == email && user.password == password
    });

     if(!user){
      return res.status(401).send("Unauthorized");
    }

    const allUsers = users.map( user => {
      return {
        id: user.id,
        email:user.email,
        firstName: user.firstName, 
        lastName: user.lastName,
      }
    })

    res.status(200).json({
      users: allUsers,
    });
  }catch(error){
    return res.status(500).json({
      message: error.message,
    })
  }
})

app.use((req, res) => {
  res.status(404).send("Route not found");
});

//app.listen(3000);
module.exports = app;