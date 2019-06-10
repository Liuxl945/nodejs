
const fs = require('fs')

const LoadBaiduImage = (res) =>{
    if(!fs.existsSync('./baidu.json')){
        let arrary = []
        res.forEach(item => {
            arrary.push({
                thumbURL: item.thumbURL,
                fromPageTitleEnc: item.fromPageTitleEnc
            })
        });
    
        fs.writeFile('./baidu.json',JSON.stringify(arrary,null,2),(err) => {
            if(err){
                console.log(err)
                return
            }
            console.log('写入文件成功')
        })
    }
}

module.exports = {
    LoadBaiduImage
}
