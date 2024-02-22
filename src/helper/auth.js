import bcrypt from 'bcryptjs'
import jwt  from 'jsonwebtoken'

const hashPassword = async(password)=>{
    let salt = await bcrypt.genSalt(Number(process.env.SALT_COUNT))
    // console.log('salt',salt);
    let hash = await bcrypt.hash(password,salt)
    // console.log('hash',hash);
    return hash
}

const hashCompare = async(password,hash)=>{
    return await bcrypt.compare(password,hash)
}

const createToken = async (payload)=>{
    const token = await jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRY,
    })
    return token
}

const decodeToken = async (token)=>{
   return await jwt.decode(token)
}

const authenticate = async(req,res,next)=>{
    let token = req?.headers?.authorization?.split(' ')[1]
    // console.log(req?.headers?.authorization);
    if(token){
        let payload = await decodeToken(token)
        // console.log(payload);
        let currentTime = +new Date()
        if(Math.floor(currentTime/1000)<payload.exp){
            next()
        }
        else{
            res.status(402).send({
                message:"Login expired"
            })
        }
    }
    else{
        res.status(402).send({
            message:"Unauthorised access"
        })
    }
}

const adminGuard = async(req,res,next)=>{
    let token = req?.headers?.authorization?.split(' ')[1]
    if(token){
        let payload = await decodeToken(token)
        if(payload.role==="admin"){
            next()
        }
        else{
            res.status(402).send({
                message:"Only admins are Allowed"
            })
        }
    }
    else{
        res.status(402).send({
            message:"Unauthorised access"
        })
    }
}

export default {
    hashPassword,
    hashCompare,
    createToken,
    authenticate,
    adminGuard
}