const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const { uploadImageToCloudinary } = require('../utils/imageUploader');


//create SubSection
exports.createSubsection = async ( req, res ) => {
    try {
        //fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body;
        //extract file/video
        const video = req.files.videoFile;
        //validation
        if( !sectionId || !title || !timeDuration || !description || !video ){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        console.log(video);
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary( video, process.env.FOLDER_NAME);
        console.log(uploadDetails);
        //create a sub-section
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        //updatre section with this subsection object id
        const updateSection  = await Section.findByIdAndUpdate({_id:sectionId},
                                                        {
                                                            $push:{
                                                                subSection:SubSectionDetails._id,
                                                            }
                                                        },
                                                        {new:true},
                                                        ).populate("subSection");
            //return response
            return res.status(200).json({
                success:true,
                message:'Sub Section Created Successfully',
                data: updateSection,
            })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Internal server error',
            error:error.message,
        })
    }
}


exports.updateSubSection = async ( req, res) => {
    try {
        const {sectionId, title, description } = req.body;
        const subSection = await SubSection.findById(sectionId);

        if( !subSection ){
            return res.status(404).json({
                success:false,
                message:'SubSection not found',
            })
        }

        if( title !== undefined ){
            subSection.title = title;
        }
        if( description !== undefined){
            subSection.description = description;
        }
        if( req.files && req.files.video !== undefined ){
            const video = req.files.video;
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME,
            )
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
        }

        await subSection.save();

        return res.json({
            success:true,
            message:'Section updated successfully',
        })
    } catch (error) {
        console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
}


exports.deleteSubSection = async ( req, res) => {
    try {
        const {subSectionId, sectionId} = req.body;
        await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $pull:{
                    subSection:subSectionId,
                }
            }
        );

        const subSection = await SubSection.findByIdAndDelete({_id:subSectionId});

        if( !subSection ){
            return res.status(404).json({
                success:false,
                message:"SubSection not found",
            })
        };

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
          })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "An error occurred while deleting the SubSection",
        })
    }
}