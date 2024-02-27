import { validationResult, body } from "express-validator";

const validate = (route)=>{
    switch (route){
        case "signup":
            return [
                body('firstName').notEmpty().withMessage("First Name is Required"),
                body('lastName').notEmpty().withMessage("Last Name is Required"),
                body("email").isEmail().withMessage("Invaild Email"),
                body("password")
                    .matches(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/)
                    .withMessage(
                        "Password must contain at least one digit, one lowercase, one uppercase,and  one special character (@#$%^&+=)"
                    )

           ]
           case "login":
            return[
                body("email").isEmail().withMessage("Invalid email address"),
        body("password").notEmpty().withMessage("Password is required"),
      ];
    case "forgotPassword":
      return [body("email").isEmail().withMessage("Invalid email address")];
    case "resetPassword":
      return [
        body("OTP").notEmpty().withMessage("OTP is required"),
        body("password")
          .isLength({ min: 8 })
          .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/)
          .withMessage(
            "Password must be at least 8 characters long and contain at least one digit, one lowercase and one uppercase letter, and one special character (@#$%^&+=)"
          ),
      ];
    default:
      return [];
  
            
    }
}

const Middleware = (req,res,next)=>{
    const error = validationResult(req)
    if(!error.isEmpty()){
        return res.status(400).json({
            error:error.array()
        })
    }
    next();
}

export default {
    validate,
    Middleware
}