import { sendNapCatPostRequest } from "./request";

export function getAccountInfo(qid){

}

export async function getGroupMemberInfo(qid:number, gid:number){
    return (await sendNapCatPostRequest("/get_group_member_info", {
        user_id: qid,
        group_id: gid
    })).data
}