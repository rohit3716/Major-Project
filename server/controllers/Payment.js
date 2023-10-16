const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require('mongoose');

//capture the payment and initiate the razorpay order
exports.capturePayment = async ( req, res ) => {
        //get course Id and user Id
        const {course_id} = req.body;
        const userId = req.user.body;
        //validationn
        //valid course Id 
        if( !course_id ) {
            return res.status(401).json({
                success:false,
                message:'please enter valid course Id',
            });
        }
        
        //valid course details
        let course;
        try {
            course = await Course.findById(course_id);
            if( !course ){
                return res.status(402).json({
                    success:false,
                    message:'Could not find the course',
                });
            }
            
            //user already pay for the same course
            const uid = new mongoose.Types.ObjectId(userId);
            if( course.studentEnrolled.includes(uid) ){
                return res.status(403).json({
                    success:false,
                    message:'Student is already enrolled in this course',
                });
            }


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }

        //order create 
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount*100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId:course_id,
                userId,
            },
        }

        //order create
        try {
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            //return response
            return res.status(200).json({
                success:true,
                courseName: course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:"Could not initiate order",
            });
        };
}

//verify signature of razorpay and server
exports.verifySignature = async ( req, res ) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if( signature === digest ){
        console.log("payment is authorized");
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            //fulfill the action
            //find course and enroll the student

            const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id:courseId},
                                            {
                                                $push:{
                                                    studentEnrolled:userId,
                                                },
                                            },
                                            {new:true},
            );

            console.log(enrolledCourse);

            //find the student and add course in the list of enrolled course
            const enrolledStudent = await User.findOneAndUpdate(
                                            {_id:userId},
                                            {
                                                $push:{
                                                    courses:courseId,
                                                }
                                            },
                                            {new:true},
            );
            console.log(enrolledStudent);

            //send mail of confirmation
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congatulations from coedeHelp",
                "Congats you are onboarded into new codeHelp Course"
            );

            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:'Signature verified and course added',
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        })
    }
}