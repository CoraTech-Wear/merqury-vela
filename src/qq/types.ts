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
    message: any,
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