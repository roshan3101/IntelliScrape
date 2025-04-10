import { ExecutionEnvironment } from "@/types/executor";
import { ExtractDataWithAiTask } from "../task/ExtractDataWithAi";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import OpenAI from "openai"

export async function ExtractDataWithAiExecutor(environment: ExecutionEnvironment<typeof ExtractDataWithAiTask>): Promise<boolean> {
    try {
        const html = environment.getInput("HTML");
        if(!html){
            environment.log.error("input-> html not defined");
        }
        const schema = environment.getInput("Schema");
        if(!schema){
            environment.log.error("input-> schema not defined");
        }

        // TODO: Implement AI extraction
        const extractedData = "{}"; // Placeholder for AI extraction

        environment.setOutput("Extracted data", extractedData);
        return true;
        
    } catch (error: unknown) {
        environment.log.error(error instanceof Error ? error.message : String(error));
        return false;
    }
}