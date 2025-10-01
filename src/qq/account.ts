import { sendNapCatPostRequest } from "./request";
import { LocalCacheManager } from "../cache";
import storageFile from "../utils/storage";
const cache = new LocalCacheManager(storageFile);
export async function getAccountInfo(qid){
    return (await sendNapCatPostRequest("/get_stranger_info", {
        user_id: qid
    })).data
}

export async function getGroupMemberInfo(qid:number, gid:number){
    return (await sendNapCatPostRequest("/get_group_member_info", {
        user_id: qid,
        group_id: gid
    })).data
}