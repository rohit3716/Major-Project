const express = require('express');
const router = express.Router();

//import the controllers

//course controller import
const {
    createCourse,
    updateCourse,
    getAllCourses,
    getCourseDetails
} = require('../controllers/Course');

//categories controller import
const {
    showAllCategory,
    createCategory,
    categoryPageDetails
} = require('../controllers/Category');

//sections controller import
const {
    createSection,
    updateSection,
    deleteSection
} = require('../controllers/Section');

//sub-section controllers import
const {
    createSubsection,
    updateSubSection,
    deleteSubSection
} = require('../controllers/Subsection');

//rating controller import
const {
    createRating,
    getAverageRating,
    getAllRating
} = require('../controllers/RatingAndReview');

//importing middlewares

const { auth, isInstructor, isStudent, isAdmin} = require('../middleware/auth');

//course routes

//courses can be created by instructors
router.post("/createCourse", auth, isInstructor, createCourse);

//routes for updating a course
router.post("/editCourse", auth, isInstructor, updateCourse);

//add a section to a course
router.post("/addSection", auth, isInstructor, createSection);

//update a section
router.post("/updateSection", auth, isInstructor, updateSection);

//delete a section
router.post("/deleteSection", auth, isInstructor, deleteSection);

//edit subsection
router.post("/updateSubSection", auth, isInstructor, updateSubSection);

//delete subsection
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

//add a subsection to a section
router.post("/addSubSection", auth, isInstructor, createSubsection);

//get all registered courses
router.get("/getAllCourses", getAllCourses);

//get details for a specific courses
router.post("/getCourseDetails", getCourseDetails);


//category courses ( only by admin )
//category can only be created by admin

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategory);
router.post("/getCategoryPageDetails", categoryPageDetails);

//rating and review
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getRating", getAllRating);

module.exports = router;