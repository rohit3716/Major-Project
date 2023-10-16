const User = require("../models/User");
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailSender = require('../utils/mailSender');
const {passwordUpdated} = require('../mail/templates/passwordUpdate');
const Profile = require('../models/Profile');
require('dotenv').config();

//send OTP
exports.sendOTP = async (req, res) => {
    try {
        //fetch email from request body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        if( checkUserPresent ){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            });
        }

        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log(otp);

        //make sure otp generated is unique 
        //check otp is unique or not
        const result = await OTP.findOne({otp:otp});

        while( result ) {
            otp = otpGenerator.generate(6, {
                specialChars:false,
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email, otp};

        //create an entry in DB for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfull

        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//signUp
exports.signUp = async (req, res) =>  {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        //validate karlo
        if( !firstName || !lastName || !email || !password || !confirmPassword
           || !otp ){
                return res.status(403).json({
                    success:false,
                    message:'All fields are required',
                });
        }
        
        //match both password
        if( password !== confirmPassword ){
            return res.status(400).json({
                success:false,
                message:'Password and Confirm Password Value does not match, please fill carefully.',
            });
        }        
        //check user already exist or not
        const existingUser = await User.findOne({email:email});
        if( existingUser ) {
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });
        }

        //find most recent otp stored for user
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOTP);
        
        //validate OTP
        if( recentOTP.length == 0){
            //otp not found
            return res.status(400).json({
                success:false,
                message:'OTP not found', 
            })
        } else if( otp !== recentOTP[0].otp) {
            //invalid Otp
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash( password, 10 );
        
        //create the user
        let approved = "";
        approved === "Instructor" ? ( approved = false ) :( approved = true );
        
        //create additional details profile for user
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const User = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType:accountType,
            additionalDetails:profileDetails._id,
            image:` https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });


        //return res
        return res.status(200).json({
            success:true,
            message:'User is registered successfully',
            user,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User cannot be registered. Please try again',
        });
    }
};

//login
exports.login = async (req, res) => {
    try {
        //get data from body of request
        const {email, password} = req.body;

        if( !email || !password ) {
            return res.status(403).json({
                success:false,
                message:'All Fields are required, please try again later',
            });
        }

        //check user exist or not
        const user = await User.findOne({email}).populate("additionalDetails");

        if( !user ) {
            return res.status(401).json({
                success:false,
                message:'User is not registered, Please signup first',
            });
        }

        //generate JWT after password matching
        if( await bcrypt.compare( password, user.password)) {
            //todo
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"24h",
            });

            //save token to user document in DB
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }

            res.Cookie("token", token, options).status( 200 ).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is Incorrect',
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login failure, please try again',
        });
    }
}

//changePassword
//TODO- HW
exports.changePassword = async (req, res) => {
    try {
         //get data from req body
    const userDetails = await User.findById(req.user.id);

    //get old password, new password, confirm new password
    const {oldPassword, newPassword, confirmNewPassword} = req.body;
    
    //validation
    const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password,
    );
    if( !isPasswordMatch ) {
        //if old pw does not match , return a 401(unautorized) error
        return res.status(401).josn({
            success:false,
            message:"The password is incorrect",
        })
    }

    //MAtch new pw and cnf new pw
    if( newPassword !== confirmNewPassword ) {
        //if new pw and cnf new pw do not match , return a (400) BAd request error
        return res.status(400).josn({
            success:false,
            message:"The password and confirm password do not match"
        })
    }
    //update pw in DB
    const encryptedPassword = await bcrypt.hash( newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate( req.user.id,
        {password:encryptedPassword},
        {new:true},
        );
    //send mail pw updated
    try {
        const emailResponse = await mailSender(
            updatedUserDetails.email,
            passwordUpdated(
                updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
            )
        );
        console.log(("Email sent successfully: ", emailResponse.response));
    } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
    }
    //return response
    return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
   

}






