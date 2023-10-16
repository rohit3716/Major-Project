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
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary( video, process.env.FOLDER_NAME);
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

//update subSection
exports.updateSubSection = async ( req, res ) => {
    try {
        
    } catch (error) {
        
    }
}