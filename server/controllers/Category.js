const Category = require('../models/Category');

//create Tag handler function
exports.createCategory = async ( req, res ) => {
    try {
        //fetch data
        const {name, description} = req.body;

        //validation
        if( !name ) {
            return re.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //entry created inDB
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);

        //return response 
        return res.status(200).json({
            success:true,
            message:'Category created successfully',
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Error while creating Category',
        })
    }
} 

//getAll tags handler function
exports.showAllCategory = async ( req, res ) => {
    try {
        const allCategory = await Category.find({}, {name:true, description:true});

        res.status(200).json({
            success:true,
            message:'All categories returned Successfully',
            data: allCategory,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
} 

//category page details

exports.categoryPageDetails = async (req, res) => {
    try {
        //get categoryId
        const {categoryId} = req.body;

        //get courses for specified category id
        const selectedCategory = await Category.findById(categoryId)
                                    .populate("courses")
                                    .exec();

        //validation
        if( !selectedCategory ){
            return res.status(404).json({
                success:false,
                message:'Data not found',
            });
        }

        //get courses for different categories
        const differentCategories = await Category.find({
                        _id:{$ne:categoryId},
                        })
                        .populate("courses")
                        .exec();


        //get top selling courses
        //HW

        //return response
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
