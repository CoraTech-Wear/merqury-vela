import { sendNapCatPostRequest } from "./request";

export async function getRecentContact(count: Number): Promise<any> {
    return (await sendNapCatPostRequest("/get_recent_contact", {
        count: count
    }));
}