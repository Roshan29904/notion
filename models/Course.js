const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

    courseName: {
        typeName: String,
    },
    courseDescription: {
        type: String,
    },
    instructor: {
        typre: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    whatYouWillLearn: {
        type: String,
        required: true,
        trim: true,
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjgectId,
            ref: "Section",
            required: true,
        }
    ],
    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
            required: true,
            trim: true,
        }
    ],
    price: {
        type: Number,
        required: true,
    },
    thumbnail: {
        types: String,
        required: true,

    },
    tag: {
        type: [String],
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
    },
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    ],
    instructions: {
        type: [String],
    },
    status: {
        type: String,
        enum: ["Draft", "Published"],
    },
    createdAt: {
        type: Date,
        Date: Date.now
    }


})


module.exports = mongoose.model("Course", courseSchema);