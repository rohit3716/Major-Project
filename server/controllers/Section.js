const Section = require('../models/Section');
const Course = require('../models/Course');

//create section
exports.createSection = async ( req, res ) => {
    try {
        //data fetch
        const { sectionName, courseId } = req.body;
        //data validation
        if( !sectionName || !courseId ) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with section on=bjectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push:{
                                                    courseContent:newSection._id,
                                                }
                                            },
                                            {new:true},
        ).populate({
            path: "courseContent",
            populate: {
                path:"subSection",
            },
        }).exec();

        //HW : use populate to replace sections/sub-sections both in the updatedCourseDetails
        //return response

        return res.status(200).json({
            success:true,
            message:'Section Created Successfully',
            updatedCourseDetails,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Unable to create Section, Please try again.',
            error:error.message,
        })
    }
}

//update section
exports.updateSection = async ( req, res ) => {
    try {
        //data fetch
        const {sectionName, sectionId} = req.body;
        //data validation
        if( !sectionName || !sectionId ) {
            return res.status(400).json({
                success:false,
                message:'Missing properties',
            })
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return res
        return res.status(200).json({
            success:true,
            message:'Section Updated Successfully',
            section,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Unable to update Section, Please try again',
            error:error.message,
        });
    }
}

//delete section
exports.deleteSection = async (req, res) => {
    try {
        //get ID
        //assuming that we are sending id in params
        const {sectionId} = req.params;
        //use findByIdandDelete
        await Section.findByIdAndDelete(sectionId);

        //TODO : Do we need to delete the entry from course schema

        //return res
        return res.status(200).json({
            success:true,
            message:'Section Deleted Successfully',
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Unable to delete Section, Please try again',
            error:error.message,
        });
    }
}