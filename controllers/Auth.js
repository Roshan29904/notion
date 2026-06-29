const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");

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
            accountType,
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


// log in


//  change password