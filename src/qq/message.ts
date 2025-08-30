import { Messages, MessageType } from "./types";

export function get_messages_preview(msg: Messages[]) {
    let preview = ""
    for (let m of msg) {
        switch (m.type) {
            case MessageType.text:
                preview += m.data.text
                break;
            case MessageType.at:
                preview += `@${m.data.name}`
                break;
            case MessageType.face:
                preview += `[表情]`
                break;
            case MessageType.video:
                preview += `[视频]`
                break;
            case MessageType.image:
                preview += `[图片]`
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