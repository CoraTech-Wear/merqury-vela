import { sendNapCatPostRequest } from "./request";
import cacheManager from "../cache";

const CACHE_TIME = 1000 * 60 * 60;

export async function getAccountInfo(qid) {
    const timeRange = { start: Date.now() - CACHE_TIME, end: Date.now() };

    // 将 cacheManager.get 包装为 Promise
    const data = await new Promise((resolve, reject) => {
        cacheManager.get('account_' + qid, timeRange, {
            success: async (data) => {
                try {
                    if (data) {
                        const data_ = JSON.parse(data);
                        resolve(data_);
                    } else {
                        const response = await sendNapCatPostRequest("/get_stranger_info", {
                            user_id: qid
                        });
                        resolve(response.data);
                    }
                } catch (error) {
                    reject(error);
                }
            },
            default: null
        });
    });

    return data;
}

export async function getGroupMemberInfo(qid:number, gid:number){
    return (await sendNapCatPostRequest("/get_group_member_info", {
        user_id: qid,
        group_id: gid
    })).data
}