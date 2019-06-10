const koa = require('koa')
const Router = require('koa-router')
const axios = require('axios')
const mysql = require('mysql')
const fs = require('fs')
const path = require('path')

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

const sleep = (timer) => {
    return new Promise((resolve)=> {
        setTimeout(() => {
            resolve()
        }, timer)
    })
}

router.get('/',async (ctx,next) => {
    async function getData(page = 1){
        let data = await axios({
            type: 'get',
            url: `https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&ct=201326592&is=&fp=result&queryWord=%E8%A1%97%E6%8B%8D&cl=2&lm=-1&ie=utf-8&oe=utf-8&adpicid=&st=&z=&ic=&hd=&latest=&copyright=&word=%E8%A1%97%E6%8B%8D&s=&se=&tab=&width=&height=&face=&istype=&qc=&nc=&fr=&expermode=&force=&pn=${page * 30}&rn=30&gsm=1e&1560168615626=`,
            header: {
                Host:'image.baidu.com'
            },
            responseType:'json'
        })
        return data
    }
    let res
    for(let i = 1;i<300;i++){
        res = await getData(i)
        try{
            if(typeof(res.data) === 'string'){
                let replace = res.data.replace(/[\\\' | 搭配\"装\"甜] |/g,'')
                res = JSON.parse(replace)
            }else{
                res = res.data
            }
            res.data.forEach(async item => {
                if(item.thumbURL && item.fromPageTitleEnc){
                    const lastIndex = item.thumbURL.lastIndexOf('.')
                    await downloadFile(item.thumbURL,`./image/2018-${i}`,`${item.fromPageTitleEnc.replace(/[\:|#|\"|*| |\?|\？|\\|\>]/g,'')}${(item.thumbURL).slice(lastIndex)}`)
                }
            })
            console.log(`已经下载了${i * 30}张图片`)
        }catch(e){
            console.log('出错了')
            break
        }
        await sleep(1500)
    }
    
    ctx.body = res.data
})


function mkdirs(dirpath){
    const dirname1 = path.dirname(dirpath)
    
    if (!fs.existsSync(path.dirname(dirpath))) {
        mkdirs(path.dirname(dirpath))
    }
    if(!fs.existsSync(dirpath)){
        fs.mkdirSync(dirpath) 
    }
    
}

async function downloadFile(url,filepath,name){

    mkdirs(path.resolve(filepath))

    let res = await axios({
        type: 'get',
        url,
        header: {
            Host:'image.baidu.com'
        },
        responseType: 'stream'
    })

    const mypath = path.resolve(filepath,name)
    const writer  = fs.createWriteStream(mypath)
    res.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish',resolve)
        writer.on('error',reject)
    })
    
}

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