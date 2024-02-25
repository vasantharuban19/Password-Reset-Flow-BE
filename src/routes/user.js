import express from 'express'
import UserController from '../controller/user.js'
import validate from '../helper/validate.js'
import Auth from '../helper/auth.js'

const router = express.Router()

router.get('/',Auth.authenticate,Auth.adminGuard,UserController.getallUsers)

router.post('/signup',validate.validate("signup"),validate.Middleware,UserController.signup)
router.post('/login',validate.validate("login"),validate.Middleware,UserController.login)
router.post('/forgot-password',validate.validate("forgotPassword"),validate.Middleware,UserController.forgotPassword)
router.post('/reset-password',validate.validate("resetPassword"),validate.Middleware,UserController.resetPassword)

export default router