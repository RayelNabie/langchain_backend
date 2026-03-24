import express from "express";
import type {Express} from "express";

const app: Express = express()
const port = 3000

app.get('/', (req, res): void => {
    res.send('Hello World!')
})

app.listen(port, (): void => {
    console.log( `Example app listening on port ${port}`)
})
