export interface Message {
    self_id: number,
    user_id: number,
    time: number,
    message_id: number,
    message_seq: number,
    real_id: number,
    real_seq: string,
    message_type: string,
    sender: MessageSender,
    raw_message: string,
    font: number,
    sub_type: string,
    message: Messages[],
    message_format: string,
    post_type: string,
    group_id: number
}

export interface MessageSender {
    user_id: number,
    nickname: string,
    sex?: Sex,
    age?: number,
    card: string,
    role?: Role
}

export enum Sex {
    "male",
    "female",
    "unknown"
}

export enum Role {
    "owner",
    "admin",
    "member"
}

export interface Messages{
    type: MessageType,
    data: any
}

export enum MessageType{
    text = "text",
    at = "at",
    face = "face",
    video = "video",
    image = "image",
    forward = "forward",
    reply = "reply",
    record = "record",
    json = "json"
}

export interface NapCatResponse<T>{
    status:string,
    retcode:number,
    data:T,
    message:string,
    echo:string|null,
    wording:string
}