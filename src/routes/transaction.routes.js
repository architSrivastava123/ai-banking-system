const {Router}=require("express")
const authMiddleware=require("../middleware/auth.middleware")
const transactionController=require("../controllers/transaction.controller")
const transactionRouter=Router()

transactionRouter.post("/create-transaction",authMiddleware.authMiddleware,transactionController.createTransaction) 

//-additional routes can be added here
//-system rounte for initiating funding
transactionRouter.post("/system/initiate-funding",authMiddleware.systemAuthMiddleware,transactionController.initiateFunding)

module.exports=transactionRouter