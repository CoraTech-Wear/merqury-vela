import crypto from '@system.crypto'
import file from '@system.file'
import request from '@system.request'
import runAsyncFunc from "../asyncapi/runAsyncFunc"

const cacheIng = new Map()
/**
 * 获取图片的缓存路径,如果没有缓存则下载并缓存
 * @param {String} url 图片的url
 * @returns {Promise<String>} 图片的缓存路径
 * @author lesetong
 */
export async function getImage(url) {
    /* const { baseUrl, fop } = buffImg.splitUrlAndFop(url) */
    const cachePath = getCachePath(url)
    try {
        await runAsyncFunc(file.access, { uri: cachePath })
        return cachePath
    } catch (e) {
        if (e.code !== 301) throw e
    }
    if (cacheIng.has(cachePath)) { return await cacheIng.get(cachePath) }
    let res
    cacheIng.set(cachePath,new Promise((resolve, reject) => { res = resolve }))
    const { token } = await runAsyncFunc(request.download, { url, filename: cachePath })
    const onDownloadComplete = runAsyncFunc(request.onDownloadComplete, { token })
    const { uri } = await onDownloadComplete
    res(uri)
    cacheIng.delete(cachePath)
    return uri
}
function getCachePath(url) {
    const name = crypto.hashDigest({ data: url, algo: "MD5" })
    return `internal://files/cache/images/${name}.png`
}
/**
 * 清除缓存
 * @returns {Promise<void>}
 * @author lesetong
 */
export async function clearImageCache() {
    await runAsyncFunc(file.rmdir, { uri: "internal://files/cache/images/", recursive: true })
}
/**
 * 获取缓存的大小
 * @returns {Promise<Number>} 缓存的大小
 * @author lesetong
 */
export async function getSize() {
    const { fileList } = await runAsyncFunc(file.list, { uri: "internal://files/cache/images/" })
    let length = 0
    fileList.forEach(item => {
        length += item.length
    });
    return length
}