import { sendNapCatPostRequest } from "./request";

export async function getRecentContact(): Promise<any> {
    return (await sendNapCatPostRequest("/get_recent_contact", {
        count: 10
    }));
}