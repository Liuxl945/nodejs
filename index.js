const koa = require('koa')
const Router = require('koa-router')
const axios = require('axios')
const mysql = require('mysql')

const app = new koa()
const router = new Router()

const poll = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'qqinsoft@youwu',
    database:'mytestdatabases'
})

const query = sql => {
    return new Promise((resolve, reject) => {
        poll.getConnection((err,connection) => {
            if(err){
                reject(err)
                return
            }
            connection.query(sql,(err,data) => {
                if(err){
                    reject(err)
                    return
                }
                resolve(data)
            })
            connection.release()
        })
    })
}


router.get('/',async (ctx,next) => {
    let res = await axios.get('https://36kr.com/')

    ctx.body = res.data
})

router.get('/select',async (ctx,next) => {
    let sql = `SELECT * FROM test`
    let res = await(query(sql))
    console.log(res)
    ctx.body = res
})



app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000)