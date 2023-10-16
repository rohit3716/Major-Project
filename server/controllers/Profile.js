const Profile = require('../models/Profile');
const User = require('../models/User');

//to update profile
exports.updateProfile = async ( req, res ) => {
    try {
        //get data  
        const { dateOfBirth="", about="", contactNumber, gender} = req.body;

        //get userId
        const id = req.user.id;

        //validation
        if( !contactNumber || !gender || !id ) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile 
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        
        //return response
        return res.status(200).json({
            success:true,
            message:'Profile updated successfully',
            profileDetails,
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
exports.deleteProfile = async ( req, res ) => {
   
    try {
         //get id
    const id = req.user.id;

    //validation
    const userDetails = await User.findById(id);
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