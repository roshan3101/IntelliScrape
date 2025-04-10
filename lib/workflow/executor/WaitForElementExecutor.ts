import { ExecutionEnvironment } from "@/types/executor";
import { WaitForElementTask } from "../task/WaitForElement";

export async function WaitForElementExecutor(environment: ExecutionEnvironment<typeof WaitForElementTask>): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        if(!selector){
            environment.log.error("input-> selector not defined");
        }
        const visibility = environment.getInput("Visibility");
        if(!visibility){
            environment.log.error("input-> visibility not defined");
        }

        await environment.getPage()!.waitForSelector(selector, {
            visible: visibility === "visible",
            hidden: visibility === "hidden",
        });

        environment.log.info(`Element ${selector} became: ${visibility}`);

        return true;
        
    } catch (error: unknown) {
        environment.log.error(error instanceof Error ? error.message : String(error));
        return false;
    }
}