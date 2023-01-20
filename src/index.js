import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv'
import joi from "joi"
import bcrypt from "bcrypt";
import { v4 as uuidV4} from "uuid";
import dayjs from "dayjs";

const app = express()
app.use(express.json())
app.use(cors())
dotenv.config();


const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
    await mongoClient.connect();
    db = mongoClient.db();
} catch (error) {
    console.log(error)
}

app.post("/login", async (req, res) => {
    const {email, password} = req.body;

    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(4).max(30).required()
    });
    const {error} = userSchema.validate({email, password}, { abortEarly: false })
    if (error) {
        const erros = error.details.map((err) => err.message)
        return res.status(422).send(erros)
    }

    try {
        const existe = await db.collection("users").findOne({email})
    
        if(existe  && bcrypt.compareSync(password, existe.password)){
            const token = uuidV4()
            const idUser = await db.collection("sessoes").findOne({idUser: existe._id})
            if(idUser?.idUser){
                await db.collection("sessoes").updateOne({idUser: idUser.idUser}, {$set: {token: token}})
            } else {
                await db.collection("sessoes").insertOne({idUser: existe._id, token})
            } 
            res.send(token)
        } else {
            res.status(400).send("Usuário ou senha incorretos!")
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }

})

app.post("/sign-up", async (req, res) => {
    const {name, email, password, repeat_password} = req.body;

    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(4).max(30).required(),
        repeat_password: joi.ref('password')
    });

    const {error} = userSchema.validate({name, email, password, repeat_password}, { abortEarly: false })
    if (error) {
        const err = error.details.map((err) => err.message)
        return res.status(422).send(err)
    }
    try {
        const existe = await db.collection("users").findOne({ email })
        if (existe) return res.status(400).send("E-mail já cadastrado!!")
    
        const senhaCriptografada = bcrypt.hashSync(password, 10)
        await db.collection("users").insertOne({name, email, password: senhaCriptografada})
        res.status(201).send("Usuário cadastrado!")
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.post("/movement", async (req, res) => {
    const {value, description, type} = req.body
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim()

    const userSchema = joi.object({
        value: joi.string().required(),
        description: joi.string().required(),
        type: joi.string().valid("entrada", "saida").required()
    });

    const {error} = userSchema.validate(req.body, { abortEarly: false })
    if (error) {
        const erros = error.details.map((err) => err.message)
        return res.status(422).send(erros)
    }

    const valor = Number(value.replace(",", "."))
    if(!valor) return res.status(422).send("Formato inválido")

    const user = await db.collection("sessoes").findOne({token: token})
    if(!user) return res.sendStatus(400)

    const date = dayjs().format("DD/MM")
    await db.collection("movement").insertOne({idUser: user.idUser, value: parseFloat(valor.toFixed(2)), description, type, date: date})
    res.sendStatus(201)
})

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`));