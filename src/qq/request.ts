import { fetch } from "../tsimports";

export async function sendNapCatPostRequest(api: string, params: any): Promise<any> {
    let baseUrl = global.config.read(c => c.napcat_httpserver_url);
    let token = global.config.read(c => c.napcat_httpserver_token);

    global.logger.log(`Sending NapCat Post to ${baseUrl}${api} with params ${JSON.stringify(params)}`);

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

    return promiseRet.data;
}