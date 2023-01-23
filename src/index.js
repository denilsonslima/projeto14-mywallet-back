import express from "express"
import cors from "cors"
import authRouter from "./routes/AuthRoutes.js"
import movimentRouter from "./routes/MovimentRoutes.js"

const app = express()
app.use(express.json())
app.use(cors())

app.use([authRouter, movimentRouter])

app.listen(process.env.PORT, () => console.log(`Servidor rodando na porta: ${process.env.PORT}`));