import express from "express"
import cors from "cors"
import authRouter from "./routes/AuthRoutes.js"
import movimentRouter from "./routes/MovimentRoutes.js"

const app = express()
app.use(express.json())
app.use(cors())

app.use([authRouter, movimentRouter])

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`));