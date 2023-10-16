const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');



//resetPasswordToken
exports.resetPasswordToken = async ( req, res ) => {
    //get email from req body

    try {
        const email = req.body.email;

    //check user for email, email validation
    const user = await User.findOne({email:email});
    if( !user ){
        return res.status(401).json({
            success:false,
            message:`Your Email: ${email} is not registered with us`,
        });
    }
    
    //generate token
    const token = crypto.randomBytes(20).toString("hex");

    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
                                        {email:email},
                                        {
                                            token:token,
                                            resetPasswordExpires:Date.now() + 60*60*1000,
                                        },
                                        {new:true}
                                    );
                            console.log("DETAILS", updatedDetails);
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    
    //send mail containing the link
    await mailSender( email,
        "Password Reset Link",
        `Password Reset Link: ${url}`);

    //return response
    return res.status(200).json({
        success:true,
        message:'Email sent successfully, please check email and change pwd',
    });    
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while reset Password',
        })
    }
    
}

//resetPassword 
exports.resetPassword = async ( req, res ) => {
    
    try {
        const { password, confirmPassword, token } = req.body;
    
    
    //validation
    if( password !== confirmPassword ){
        return res.status(503).json({
            success:false,
            message:'Password not match',
        });
    }

    //get user details from DB using token
    const userDetails = await User.findOne({token:token});
    //if no entry - invalid token 
    if( !userDetails ) {
        return req.status(501).json({
            success:false,
            message:'Token is Invalid',
        });
    }

    //token time check
    if( userDetails.resetPasswordExpires > Date.now() ) {
        return res.status(502).json({
            success:false,
            message:'Token is expired, please regenerate Your Token',
        });
    }
    //hash pwd
    const encryptedPassword = await bcrypt.hash(password, 10);

    //password update
    await User.findOneAndUpdate(
        {token:token},
        {password:encryptedPassword},
        {new:true},
    );


    //return response
    return res.status(200).json({
        success:true,
        message:'Password Reset Successfull',
    })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while reset Password',
        })
    }
    
    //data fetch
    
}