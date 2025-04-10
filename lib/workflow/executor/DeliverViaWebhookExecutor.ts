import { ExecutionEnvironment } from "@/types/executor";
import { DeliverViaWebhookTask } from "../task/DeliveryViaWebhook";

export async function DeliverViaWebhookExecutor(environment: ExecutionEnvironment<typeof DeliverViaWebhookTask>): Promise<boolean> {
    try {
        const targetUrl = environment.getInput("Target URL");
        if(!targetUrl){
            environment.log.error("input-> targetUrl not defined");
        }
        const body = environment.getInput("Body");
        if(!body){
            environment.log.error("input-> body not defined");
        }

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        environment.log.info(`Data delivered to ${targetUrl}`);
        return true;
        
    } catch (error: unknown) {
        environment.log.error(error instanceof Error ? error.message : String(error));
        return false;
    }
}