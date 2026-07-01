const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require('../mail/templates/passwordUpdate');
const Profile = require('../models/Profile');
require("dotenv").config();

// send otp
exports.sendOTP = async (req, res) => {

    try {
        // fetch email from request body
        const { email } = req.body;

        // check if user already exist 
        const checkUserPresent = await User.findOne({ email });

        /// if user already exist, then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                sucess: false,
                message: "User already registered"
            })
        }

        // grnerator otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated:", otp);

        // check unique otp or not
        const result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        // create an entry for otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response successful
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// sing up
exports.signUp = async (req, res) => {
    try {
        // data fecth from request ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validate krlo
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        // 2 password match karlo
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and ConfirmPassword does not match, please try again"
            });

        }

        // check user already exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered",
            });
        }
        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        //validate otp
        if (recentOtp.length == 0) {
            //otp not found
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        }
        else if (otp !== recentOtp.otp) {
            // invalid OTP
            return res.status(400).json({
                sucess: false,
                message: "Invalid OTP",
            })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //  entry create in DB

        const profileDetails = await profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accounttype,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,
        })
        // return res
        return res.status(200).json({
            success:true,
            message: "User registered Successfully",
            User,
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again "
        })
    }
}


// Log in
exports.login = async (req, res) => {
    try{
        // get data from req body
        const {email, password} = req.body;
        //validate data
        if (!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again",
            })
        }
        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            })
        }
        //generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)){

            const playload = {
                email: user.email,
                id: user._id,
                accounttype: user.accounttype,
            }
            const token = jwt.sign(playload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            })
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect",
            })
        }
        
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure, please try again"  
        })
    }
}

//  change password
exports.changePassword = async (req, res) => {
    try{
        //Get user data from req.user
        const userDetails = await User.findById(req.user.id);
        
        //get oldPassword, newPassword
        const {oldPassword, newPassword} = req.body;

        //Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword, 
            userDetails.password
        );

        if(!isPasswordMatch) {
            //if old password does not match, return a 401 (unauthorized) error
            return res.status(401).json({
                success: false,
                message: 'The Password is Incorrect',
            })
        }

        //update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        //send notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                `Password Updated Successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
                passwordUpdated(
                    updatedUserDetails.email,
                    updatedUserDetails.firstName,
                )
            )
            console.log('Email sent successfully................', emailResponse);
        } catch (error) {
            //if there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.log('Error Occurred While Sending Email: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error Occurred While Sending Email',
                error: error.message,
            });
        }
        //Return success response
        return res.status(200).json({ 
            success: true, 
            message: 'Password Updated Successfully' 
        });

    }
    catch(error){
        console.error('Error Occurred While Updating Password', error);
        return res.status(500).json({
            success: false,
            message: 'Error Occurred While Updating Password',
            error: error.message,
        });
    }
}