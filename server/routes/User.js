const express = require('express');
const router = express.Router();


//Import the required controllers and middlewares function

const {
    login,
    signUp,
    sendOTP,
    changePassword
} = require('../controllers/Auth');

const {
    resetPasswordToken,
     resetPassword} = require('../controllers/ResetPassword');

const { auth } = require('../middleware/auth');

//Routes for login signup and authentication
//Authentication routes`
//Route for user login
router.post("/login", login);

//Route for user signup
router.post("/signup", signUp);

//Route for sending otp to the user's email
router.post("/sendotp", sendOTP);

//Route for changing the pw
router.post("/changepassword", auth, changePassword);


//Reset Pw
//route for generating reset pw token
router.post("/reset-password-token", resetPasswordToken);

//route for resetting pw after verification
router.post("/reset-password", resetPassword);

//export the router
module.exports = router;
