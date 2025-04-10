import { ExecutionEnvironment } from "@/types/executor";
import { ExtractDataWithAiTask } from "../task/ExtractDataWithAi";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import OpenAI from "openai"

export async function ExtractDataWithAiExecutor(environment: ExecutionEnvironment<typeof ExtractDataWithAiTask>): Promise<boolean> {
    try {
        const credentials = environment.getInput("Credentials");
        if(!credentials){
            environment.log.error("input-> credentials not defined");
        }
        
        const prompt = environment.getInput("Prompt");
        if(!prompt){
            environment.log.error("input-> prompt not defined");
        }
        
        const content = environment.getInput("Content");
        if(!content){
            environment.log.error("input-> content not defined");
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