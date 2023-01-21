import db from '../config/database.js'
import dayjs from 'dayjs';

export async function createMoviment(req, res){
    try {
        const {value, description, type} = req.body
        const valor = Number(value.replace(",", "."))
        if(!valor) return res.status(422).send("Formato inválido")
        const user =  res.locals.sessao
        const date = dayjs().format("DD/MM")
        await db.collection("movement").insertOne({idUser: user.idUser, value: parseFloat(valor.toFixed(2)), description, type, date: date})
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}

export async function listMoviment(_req, res){
    try {
        const user =  res.locals.sessao
        const dados = await db.collection("movement").find({idUser: user.idUser}).toArray()
        console.log(dados)
        res.send(dados)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}