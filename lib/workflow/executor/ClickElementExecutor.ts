import { ExecutionEnvironment } from "@/types/executor";
import { FillInputTask } from "../task/FillInput";
import { ClickElementTask } from "../task/ClickElement";

export async function ClickElementExecutor (environment: ExecutionEnvironment<typeof ClickElementTask>) : Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        if(!selector){
            environment.log.error("input-> selector not defined");
        }

        await environment.getPage()!.click(selector);

        return true;
        
    } catch (error:any) {
        environment.log.error(error.message);
        return false
    }
}