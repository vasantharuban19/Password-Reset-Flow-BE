import UserModel from "../models/user.js";
import auth from '../helper/auth.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();

const getallUsers = async (req, res) => {
    try {
      const user = await UserModel.find({},{password:0});
      res.status(200).send({
        message: "User Data Fetched Successfully",
        user,
      });
    } catch (error) {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  };

const signup = async(req,res)=>{
    try{
        const {firstName,lastName,email,password} = req.body
        console.log(firstName,lastName,email,password);
        
        if(!firstName || !lastName || !email || !password){
            return res.status(400).json({
                message:"All fields are required"
            })
        }
        const existUser = await UserModel.findOne({email})
        if(existUser){
            return res.status(400).json({
                message:"Email is already Exist"
            })
        }
        const hash = await auth.hashPassword(password)
        const newUser = new UserModel({
            firstName,
            lastName,
            email,
            password:hash
        }) 
        await newUser.save()
        let userData = await UserModel.findOne(
            {email:req.body.email},
            {_id:0,email:0,password:0,status:0,createdAt:0}
        )
        res.status(201).json({
            message:"User created successfully",userData
        })
    }
    catch{
        console.error(error);
        res.status(500).json({
          message: "Internal Server Error",
          error: error.message,
        });
    }
}

const login = async(req,res)=>{
    try{
        const {email,password} = req.body
        const user = await UserModel.findOne({email})

        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }
        if(!user.password){
            return res.status(401).json({
                message:"Invalid Password"
            })
        }
        const validPassword = await auth.hashCompare(password,user.password)
        if(!validPassword){
            return res.status(401).json({
                message:"Incorrect Password"
            })
        }
        const token = await auth.createToken({
            id:user._id,
            firstName:user.firstName,
            lastName:user.lastName,
            email:user.email,
            role:user.role,
            createdAt:user.createdAt
        },'10m')
        let userData = await UserModel.findOne(
            {email:req.body.email},
            {_id:0,email:0,password:0,status:0,createdAt:0}
        )
        
        res.status(200).json({
            message:"Login Successfully",token,userData
        })
    }
    catch(error){
        console.error(error);
        res.status(500).json({
          message: "Internal Server Error",
          error: error.message,
        });
    }
}

const forgotPassword = async(req,res)=>{
    const {email} = req.body
    try{
        let user = await UserModel.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const generateOTP = ()=>{
            const char = "0123456789"
            return Array.from(
                { length: 6 },
                ()=> char[Math.floor(Math.random() * char.length)]
            ).join("")
        }
        const OTP = generateOTP()
        user.resetPasswordOtp = OTP
        user.resetPasswordExpires = Date.now() + 3600000
        await user.save()

        const transporter = nodemailer.createTransport({
            service:"gmail",
            secure: true,
            auth:{
                user:process.env.USER_MAIL,
                pass:process.env.PASS_MAIL
               
            },
            
        })

        const mailOption = {
            from:"vasanthruban1920@gmail.com",
            to: user.email,
            subject: "Password Reset",
            html: `
            <div>
            <p>Dear ${user.firstName} ${user.lastName},</p>
            <p>We received a request to reset your password. Here is your One-Time Password (OTP): <strong>${OTP}</strong></p>
            --<br>
            Thank You,<br>
            <p>${user.firstName} ${user.lastName}
            </div>
            `
        }
        await transporter.sendMail(mailOption)
        res.status(200).json({message:"Password Reset email Sent"})
    }
    catch(error){
        console.error(error);
        res.status(500).json({
          message: "Internal Server Error",
        });
    }
}

const resetPassword = async (req,res)=>{
    try{
        const {OTP,password} = req.body
        const user = await UserModel.findOne({
            resetPasswordOtp: OTP,
            resetPasswordExpires:{$gt:Date.now()}
        })
        if(!user){
            const message = user ? "OTP Expired" : "Invalid OTP"
            return res.status(404).json({message})
        }
        const hashPassword = await auth.hashPassword(password)
        user.password = hashPassword
        user.resetPasswordOtp = null
        user.resetPasswordExpires = null
        await user.save()
        
        res.status(200).json({
            message:"Password changed Successfully"
        })
    }
    catch(error){
        console.error(error);
        res.status(500).json({
          message: "Internal Server Error",
        });
    }
}

export default{
    signup,
    login,
    forgotPassword,
    resetPassword,
    getallUsers
}