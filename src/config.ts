import { asyncFile } from "./asyncapi/file";

const CONFIG_PATH = "internal://files/config.json";

export interface AppConfig {
    napcat_httpserver_url: string,
    napcat_httpserver_token: string,
    noimgMode: boolean,
    dialogCount: number,
    messageCount: number,
    animationEnabled: boolean
}

function defaultConfig(): AppConfig {
    return {
        napcat_httpserver_url: "",
        napcat_httpserver_token: "",
        noimgMode: true,
        dialogCount: 10,
        messageCount: 10,
        animationEnabled: false
    };
}

class ConfigSystem {
    private config: AppConfig | null = null;

    async init(): Promise<void> {
        const exists = await this.exists(CONFIG_PATH);
        if (exists) {
            const text = await asyncFile.readText({ uri: CONFIG_PATH, encoding: "utf-8" });
            this.config = JSON.parse(text);
        } else {
            this.config = defaultConfig();
            await this.persist(this.config);
        }
    }

    read<R>(f: (cfg: Readonly<AppConfig>) => R): R {
        if (!this.config) throw new Error("Config not initialized");
        return f(this.config);
    }

    async write<R>(f: (cfg: AppConfig) => R): Promise<R> {
        if (!this.config) throw new Error("Config not initialized");
        const result = f(this.config);
        await this.persist(this.config);
        return result;
    }

    async save(): Promise<void> {
        if (!this.config) throw new Error("Config not initialized");
        await this.persist(this.config);
    }

    private async persist(cfg: AppConfig): Promise<void> {
        const data = JSON.stringify(cfg, null, 2);
        await asyncFile.writeText({ uri: CONFIG_PATH, text: data, encoding: "utf-8" });
    }

    private async exists(uri: string): Promise<boolean> {
        try {
            await asyncFile.access({ uri });
            return true;
        } catch {
            return false;
        }
    }
}

export const Config = new ConfigSystem();