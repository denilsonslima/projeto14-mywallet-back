import { createMoviment, listMoviment } from '../controller/Movement.js'
import { Router } from 'express'
import { validateSchema } from '../middleware/validateSchema.js'
import { userSchema } from '../schema/MovemetSchema.js'
import { authValidation } from '../middleware/AuthMiddleware.js'

const movimentRouter = Router()

// Rotas de autenticação
movimentRouter.post("/movement", authValidation, validateSchema(userSchema), createMoviment)
movimentRouter.get("/movement",authValidation, listMoviment)

export default movimentRouter