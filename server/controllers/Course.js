const Category = require('../models/Category');
const Course = require('../models/Course');
const Tag = require('../models/Tags');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

exports.createCourse = async ( req, res ) => {
    try {

        //get user id from request object
        const userId = req.user.id;
        //fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, tag, category, status, instructions, } = req.body;
        
        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if( !courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !category ) {
            return res.status( 400).json({
                success:false,
                message:'All Fields are required',
            });
        }

        if( !status || status === undefined ){
            status = "Draft";
        }

        //check for instructor
        const instructorDetails = await User.findById(userId, {accountType:"Instructor"});
        console.log('Instructor Details: ', instructorDetails);

        if( !instructorDetails ){
            return res.status(404).json({
                success:false,
                message:'Instructor details not found',
            })
        }

        //check given tag is valid or not
        const categoryDetails = await Tag.findById(category);
        if( !categoryDetails ) {
            return res.status(404).json({
                success:false,
                message:'Category Details not found',
            });
        }

        //Upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        console.log(thumbnailImage); 

        //create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status:status,
            instructions:instructions,
        });

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                },
            },
            {new:true},
        );

        //Add the new course to the categories
        await Category.findByIdAndUpdate(
            {_id:category},
            {
                $push: {
                    course:newCourse._id,
                },
            },
            {new:true},
        );

        //Update tag schema
        //TODO


        //return response
        return res.status(200).json({
            success:true,
            message:'Course created Successfully',
            data:newCourse,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create course',
            error: error.message,
        });
    }
}


//get All courses handler function
exports.getAllCourses = async ( req, res ) => {
    try {
        //TODO: change the below statement incrementally
        const allCourses = await Course.find(
                    {},
                    {
                        courseName:true,
                        price:true,
                        thumbnail:true,
                        instructor:true,
                        ratingAndReviews:true,
                        studentEnrolled:true,
                    }
        ).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        });
    } catch (error) {
        console.log(error);
        return res.status( 500 ).json({
            success:false,
            message:'Cannot fetch course data',
            error:error.message,
        })
    }
}

//getCourse Details
exports.getCourseDetails = async (req, res) => {
    try {
        //get course id from request ki body
        const {courseId} = req.body;

        //find course related to that courseId
        const courseDetails = await Course.find(
                        {_id:courseId})
                        .populate(
                            {
                                path:"instructor",
                                populate:{
                                    path:"additionalDetails",
                                },
                            }
                        )
                        .populate("category")
                        .populate("ratingAndreviews")
                        .populate({
                            path:"courseContent",
                            populate:{
                                path:"subSection",
                            },
                        })
                        .exec();

        if( !courseDetails ) {
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            });
        }

        //return response
        return res.status( 200 ).json({
            success:true,
            message:'Course Details fetched Successfully',
            data:courseDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}