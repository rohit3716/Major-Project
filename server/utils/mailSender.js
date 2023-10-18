const nodemailer = require('nodemailer');

const mailSender = async ( email, title, body ) => {
    // console.log(email, title, body);
    try {
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            secure:true,
           
        })

        let info = await transporter.sendMail({
            from: 'StudyNotion || CodeHelp - By BAbbar',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })
        // console.log("info",info);
        return info;
    } catch (error) {
        console.log("Mail Error" , error.message);
    }
}

module.exports = mailSender;

