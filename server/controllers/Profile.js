const Profile = require('../models/Profile');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

//to update profile
exports.updateProfile = async ( req, res ) => {
    try {
        //get data  
        const { dateOfBirth="", about="", contactNumber, gender} = req.body;

        //get userId
        const id = req.user.id;

        //validation
        if( !contactNumber || !id ) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //find profile
        const userDetails = await User.findById(id);
        // console.log("userDetails", userDetails);
        const profile = await Profile.findById(userDetails.additionalDetails);
        // console.log("profile", profile);

        //update profile 
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber;
        profile.gender = gender;
        
        //save the updated profile
        await profile.save();
        
        //return response
        return res.status(200).json({
            success:true,
            message:'Profile updated successfully',
            profile,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
};

//to delete profile
//TODO: How to schedule deletion request?
exports.deleteAccount = async ( req, res ) => {
   
    try {
         //get id
        
    const id = req.user.id;
    console.log("ID", id);
    //validation
    const userDetails = await User.findById({_id:id});
    console.log("userDEtails: ", userDetails);
    
    if( !userDetails ) {
        return res.status(404).json({
            success:false,
            message:'User not found',
        });
    }

    //delete Profile
    await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});


    //TODO: unenroll user from all enrolled courses 
    //delete user
    await User.findByIdAndDelete({_id:id});

    //return response
    return res.status(200).json({
        success:true,
        message:'User Deleted successfully',
    });
    } catch (error) {
        console.log(error);
		res
			.status(500)
			.json({ success: false, message: "User Cannot be deleted successfully" });
    }
    
   
}


exports.getAllUserDetails = async ( req, res ) => {
    try {
        //get id
        const id = req.user.id;
        
        //validate id
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        //return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched successfully',
            data:userDetails,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        console.log(image);

        const updatedProfile = await User.findByIdAndUpdate(
            {_id:userId},
            {image: image.secure_url},
            {new:true}
        );

        res.send({
            success:true,
            message:'Image uploaded successfully',
            data: updatedProfile,
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}

exports.getEnrolledCourses = async (req, res ) => {
    try {
        const userId = req.user.id;
        const userDetails = await User.findOne({
            _id:userId,
        })
        .populate("courses")
        .exec()

        if( !userDetails ){
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
              })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
          })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}