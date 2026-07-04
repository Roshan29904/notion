const Section = require("../models/Section");
const Course = require("../models/Course");


exports.createSection = async (req, res) => {
    try {
        // data fetch
        const { sectionName, courseId } = req.body;
        //data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties",
            })
        }
        //create section
        const newSection = await Section.create({ sectionName });
        //update course with section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                }
            },
            { new: true },
        );

        //return response
        return res.status(200).json({
            success: true,
            message: "section created successfully",
            updatedCourseDetails,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to create Section, please try again",
            error: error.message,
        });
    }
}



// Update section handler function

exports.updateSection = async (req, res) => {
    try {
        //data input 
        const { sectionName, sectionId } = req.body;
        //data validation 
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties",
            })
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });

        //return res
        return res.status(200).json({
            success: true,
            message: "Section Updated Successfully",
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update Section, please try again",
            error: error.message,
        });
    }
}



//delete section handler function

exports.deleteSection = async (req, res) => {
    try{
        //get id -- assuming that we are sending id in params 
        const {sectionId} = req.body; 
        //use findByoneDelete
        await Section.findByIdAndDelete(sectionId);
        //return response
        return res.status(200).json({
            success: true,
            message: "section deleted successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Unable to update Section, please try again",
            error: error.message,
        });
    }
}