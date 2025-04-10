import { ExecutionEnvironment } from "@/types/executor";
import { DeliverViaWebhookTask } from "../task/DeliverViaWebhook";

export async function DeliverViaWebhookExecutor(environment: ExecutionEnvironment<typeof DeliverViaWebhookTask>): Promise<boolean> {
    try {
        const url = environment.getInput("URL");
        if(!url){
            environment.log.error("input-> url not defined");
        }
        const data = environment.getInput("Data");
        if(!data){
            environment.log.error("input-> data not defined");
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data,
        });

        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        environment.log.info(`Data delivered to ${url}`);
        return true;
        
    } catch (error: unknown) {
        environment.log.error(error instanceof Error ? error.message : String(error));
        return false;
    }
}