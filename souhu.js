const axios = require('axios')
const cheerio = require('cheerio')

const Crawler = (data)=> {
    let $ = cheerio.load(data)

    let array = []
    $('')
}

const getSouhuData = async () => {
    // url https://tuijian.hao123.com/
    let data = await axios({
        type: 'get',
        // url: 'https://www.hao123.com/feedData/data?callback=jQuery18201728076672761667_1560231901810&type=rec&app_from=pc_tuijian&rn=10&pn=25&_=1560232399186',
        url: 'https://www.hao123.com/mid?from=shoubai&key=8808372458041060693&type=rec',
    })

    let res = data.data.slice(data.data.indexOf("{"),data.data.lastIndexOf(')'))
    return res
}





module.exports = {
    getSouhuData
}