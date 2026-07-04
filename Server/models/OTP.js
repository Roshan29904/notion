const mongoose = require("mongoose");
const mailSender = require('../utils/mailSender');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,

    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60,

    },
});


//a  function to send email

//async function -> to send emails
async function sendVerificationEMail(email, otp) {
    //Create a transporter to send emails

    //Define the email options

    //send the email
    try {
        const mailResponse = await mailSender(
            email,
            "Verification Email from StudyNotion",
            emailTemplate(otp)
        );
        console.log("Email sent successfully", mailResponse);
    } catch (error) {
        console.log("Error occured while sending verification email", error);
        // Don't throw error - let OTP be created even if email fails
    }
}

//Defining a pre-save hook to send email before the document has been saved
OTPSchema.pre("save", async function () {
    console.log("New document saved to the database");

    //only send an email when a new document is created 
    if (this.isNew) {
        try {
            await sendVerificationEMail(this.email, this.otp);
        } catch (error) {
            console.log("Error sending verification email, but OTP will still be created:", error);
            // Don't throw error - allow OTP to be saved even if email fails
        }
    }
})



//module.exports = mongoose.model("OTP", OTPSchema);

const OTP = mongoose.model("OTP", OTPSchema);
module.exports = OTP;