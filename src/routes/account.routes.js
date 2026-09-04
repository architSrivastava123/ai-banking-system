const express=require('express')
const authMiddleware=require('../middleware/auth.middleware')
const accountController=require('../controllers/account.controller')

const router=express.Router();

router.post('/create-account',authMiddleware.authMiddleware,accountController.createAccount)
router.get('/get-account',authMiddleware.authMiddleware,accountController.getUserAccount)
router.get('/get-account-balance/:accountId',authMiddleware.authMiddleware,accountController.getAccountBalance)

module.exports=router