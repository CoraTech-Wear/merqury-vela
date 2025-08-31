const https = require('https');
const fs = require('fs');

/**
 * 下载网络图片到本地
 * @param {string} url - 图片的网络地址
 * @param {string} filePath - 保存图片的本地文件路径
 * @returns {Promise<string>} - 返回一个 Promise，成功时解析为保存路径，失败时拒绝并返回错误
 */
function downloadImage(url, filePath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`请求失败，状态码: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve(filePath);
            });

            fileStream.on('error', (error) => {
                fs.unlink(filePath, () => {}); // 删除可能已创建的损坏文件
                reject(error);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

const baseUrl = 'https://docs-v1.zhamao.xin/face/{id}.png';
const savePath = './src/common/face';
const maxId = 221;
const 并发数 = 3;
let i = 163

const downloadNext =async () => {
    if (i > maxId) {
        return;
    }
    try{
        await downloadImage(baseUrl.replace('{id}', i),savePath+`/${i}.png`)
        console.log(`下载完成${i}`)
    }catch(e){
        console.log(`下载失败${i}`)
    }
    i++
    setTimeout(()=>{
        downloadNext()
    },1000)
}
for (let i = 0; i < 并发数; i++) {
    setTimeout(()=>{
        downloadNext()
    },100*i)
}
