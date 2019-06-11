const koa = require('koa')
const Router = require('koa-router')
const axios = require('axios')
const mysql = require('mysql')
const fs = require('fs')
const path = require('path')
const { CrawlerHao123 } = require('./hao123')
const cheerio = require('cheerio')
const moment = require('moment')

const app = new koa()
const router = new Router()

const poll = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'qqinsoft@youwu',
    database:'myblog'
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
    return
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
    let IS_NONE = false
    for(let i = 1;i<100;i++){
        res = await getData(i)
        try{
            if(typeof(res.data) === 'string'){
                let replace = res.data.replace(/[\\\']/g,'')
                res = JSON.parse(replace)
            }else{
                res = res.data
            }
            res.data.forEach(async (item,index) => {
                if(item.thumbURL && item.fromPageTitleEnc){
                    const lastIndex = item.thumbURL.lastIndexOf('.')
                    await downloadFile(item.thumbURL,`./image/2018-${i}`,`${item.fromPageTitleEnc.replace(/[\:|#|\"|*| |\?|\？|\\|\>]/g,'')}${(item.thumbURL).slice(lastIndex)}`)
                }else{
                    if(index < 30){
                        IS_NONE = true
                    }
                }
            })
            if(IS_NONE){
                console.log('爬完了')
                break
            }
            console.log(`已经下载了${i * 30}张图片`)
        }catch(e){
            console.log('出错了')
        }
        await sleep(1500)
    }
    
    ctx.body = res.data
})


function mkdirs(dirpath){
    
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
    let mumber = 0
    for(let i = 1;i<4000;i++){
        let res = await CrawlerHao123(i)
        res = res.data.slice(res.data.indexOf('{'),res.data.lastIndexOf(')'))
        res = JSON.parse(res)

        let sql = `INSERT INTO article_crawler (title,url,content,intro,author,add_time,article_img,article_thump) VALUES `

        res.data.forEach(async e => {
            let article_img = e.tplName === 'noneImg' ? '' : e.img0_l
            let article_thump = e.tplName === 'noneImg' ? '' : e.img0
            let time = moment.unix(e.time).format('YYYY-MM-DD HH:mm:ss')
            let content = e.url
            // let content = await axios({
            //     url: e.url,
            //     type: 'get'
            // })
            // let $ = cheerio.load(content.data)
            // content = $('#left-container .article-content').html()

            sql += `('${e.title}','${content}','${content}','${e.desc}','${e.source}','${time}','${article_img}','${article_thump}'),`
            mumber++
        })

        sql = sql.slice(0,sql.length-1)
        try{
            let dataList = await query(sql)
        }catch(e){

        }
        
        console.log(`爬取了${i}次---${mumber}条数据`)
        await sleep(1000)
    }
    ctx.body = '爬完了'

    
})



app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000)