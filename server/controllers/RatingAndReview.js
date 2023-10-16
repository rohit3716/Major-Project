const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const { default: mongoose } = require('mongoose');

//create Rating
exports.createRating = async (req, res) => {
    try {
        //get user id
        const userId = req.user.body;
        
        //fetch data from req body
        const { rating, review, courseId } = req.body;

        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
                                    {
                                        _id:courseId,
                                        studentEnrolled:{
                                            $elemMatch:{
                                                $eq:userId
                                            },
                                        },
                                    },
        )

        if( !courseDetails ){
            return res.status(400).json({
                success:false,
                message:'Student is not enrolled in this course',
            });
        }

        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                        user:userId,
                                        course:courseId,
                                    });

        if( alreadyReviewed ){
            return res.status(403).json({
                success:false,
                message:'Course is already reviewed by the user',
            });
        }

        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                                    user:userId,
                                                    rating,
                                                    review,
                                                    course:courseId,
        });


        //update course with this rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                            {_id:userId},
                            {
                                $push:{
                                    ratingAndReviews:ratingReview._id,
                                }
                            }, 
                            {new:true},
        )
        console.log(updatedCourseDetails);
        
        //return response
        return res.status(200).json({
            success:true,
            message:'Rating and review created successfully',
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Error in while creating Rating and review',
        })
    }
}




//getAverageRating
exports.getAverageRating = async ( req, res ) => {
    
    try {
        //get courseId
        const courseId = req.body.courseId;

    //calculate avg rating
    const result = await RatingAndReview.aggregate([
        {
            $match:{
                course: new mongoose.Types.ObjectId(courseId),
            },
        },
        {
            $group:{
                _id:null,
                averageRating: {
                    $avg:"$rating"
                },
            },
        }
    ]);

    //return rating ( if rating exist then )
    if( result.length > 0 ){
        return res.status(200).json({
            success:true,
            averageRating:result[0].averageRating,
        });
    }

    //if no rating review exist 
    return res.status(200).json({
        success:true,
        message:'Average rating is 0, no ratings given till now',
        averageRating:0,
    })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
    
}

//getAllRatingAndReviews
exports.getAllRating = async ( req, res ) => {
    try {
        const allReviews = await RatingAndReview.find({})
                                .sort({rating:"desc"})
                                .populate({
                                    path:"user",
                                    select:" firstName lastName email image",
                                })
                                .populate({
                                    path:"course",
                                    select:"courseName",
                                })
                                .exec();

                return res.status(200).json({
                    success:true,
                    message:'All reviews fetched successfully',
                    data: allReviews,
                });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}