import { fetch } from "../tsimports";
import { NapCatResponse } from "./types";

export async function sendNapCatPostRequest<T>(api: string, params: any): Promise<NapCatResponse<T>> {
    let baseUrl = "http://"+global.config.read(c => c.napcat_httpserver_url);
    let token = global.config.read(c => c.napcat_httpserver_token);

    global.logger.log(`Sending NapCat Post to ${baseUrl}${api} with params ${JSON.stringify(params)}`);

    try {
        let promiseRet = await fetch.fetch({
            url: `${baseUrl}${api}`,
            method: "POST",
            data: JSON.stringify(params),
            responseType: "json",
            header: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        return (promiseRet.data.data as NapCatResponse<T>);
    } catch (err) {
        global.logger.error(`NapCat Post request failed: ${JSON.stringify(err)}`);
        throw err;
    }
}