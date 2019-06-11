
const axios = require('axios')


const CrawlerHao123 = async (page = 1) => {
    let data = await axios({
        type: 'get',
        url: `https://www.hao123.com/feedData/data?callback=jQuery1820856337428433422_1560254506038&type=rec&app_from=pc_tuijian&rn=10&pn=${page}&_=1560254527088`,
    })
    
    return data
}

module.exports = {
    CrawlerHao123
}