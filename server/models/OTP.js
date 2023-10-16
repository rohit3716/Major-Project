const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60,
    },
});

//function to send emails
async function sendVerificationEmail( email, otp ){
    //create a transporter to send emails

    //define the email options

    //send the mail
    try {
        const mailResponse = await mailSender( email, "Verification Email from StudyNotion", emailTemplate(otp));
        console.log("Email sent successfully: ", mailResponse);
    } catch (error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}

//Define a pre-save hook to send email after the document has been saved
OTPSchema.pre("save",async function(next) {
    console.log("New document saved to DB");
    if( this.isNew )
    await sendVerificationEmail( this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP", OTPSchema);