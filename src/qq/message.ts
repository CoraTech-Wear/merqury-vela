import { asyncFile } from "../asyncapi/file";
import base64ToUint8Array from "../utils/b64ToArraryBuffer";
import { sendNapCatPostRequest } from "./request";
import { Messages, MessageType } from "./types";

export function getMessagesPreview(msg: Messages[]) {
    let preview = ""
    for (let m of msg) {
        switch (m.type) {
            case MessageType.text:
                preview += m.data.text
                break;
            case MessageType.at:
                preview += `@${m.data.name??m.data.qq}`
                break;
            case MessageType.face:
                preview += `[表情]`
                break;
            case MessageType.video:
                preview += `[视频]`
                break;
            case MessageType.image:
                preview += m.data.summary??`[图片]`
                break;
            case MessageType.forward:
                preview += `[转发]`
                break;
            case MessageType.record:
                preview += "[语音]"
                break;
            case MessageType.reply:
                break;
            default:
                preview += `[${m.type}]`;
        }
        if (preview.length > 30) {
            break;
        }
    }
    return preview
}

export async function getGroupMessageHistory(id: string, messageSeq: string, count: number=10) {
    return (await sendNapCatPostRequest("/get_group_msg_history", {
        group_id: id,
        message_seq: messageSeq,
        count
    }));
}

export async function getPrivateMessageHistory(id: string, messageSeq: string, count: number=10) {
    return (await sendNapCatPostRequest("/get_friend_msg_history", {
        user_id: id,
        message_seq: messageSeq,
        count
    }));
}

export async function getMessage(id: string){
    return (await sendNapCatPostRequest("/get_msg", {
        message_id: id
    }));
}

export async function getRecord(file:string){
    const uri = `internal://files/cache/record/${file.replace(".amr",".mp3")}`
    if(await asyncFile.access({uri}).catch(()=>false)){
        return uri
    }
    const {base64} = (await sendNapCatPostRequest<{base64:string}>("/get_record", {
        file,
        out_format:"mp3"
    })).data
    const buffer = base64ToUint8Array(base64)
    await asyncFile.writeArrayBuffer({
        uri,
        buffer
    })
    return uri
}

export async function sendGroupMessage(group_id: string, message: Messages[]) {
    return (await sendNapCatPostRequest("/send_group_msg", {
        group_id,
        message
    }));
}

export async function sendPrivateMessage(user_id: string, message: Messages[]) {
    return (await sendNapCatPostRequest("/send_private_msg", {
        user_id,
        message
    }));
}
