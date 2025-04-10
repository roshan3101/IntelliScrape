import { TaskType } from "@/types/task";
import { ExecutionEnvironment } from "@/types/executor";
import { WorkflowTask } from "@/types/workflow";
import puppeteer from "puppeteer";

// Type definition for executor functions
type ExecutorFn<T extends WorkflowTask> = (environment: ExecutionEnvironment<T>) => Promise<boolean>;

// Registry type mapping each task type to its executor function
type RegistryType = {
    [K in TaskType]: ExecutorFn<WorkflowTask & { type: K }>;
};

// Launch Browser Executor
export async function LaunchBroswerExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url");
        const browser = await puppeteer.connect({
            browserWSEndpoint: "wss://brd-customer-hl_a5a3ac65-zone-intelliscrapebrowser:vu25wowy463z@brd.superproxy.io:9222",
        });

        environment.log.info("Browser started successfully");
        environment.setBrowser(browser);
        const page = await browser.newPage();
        page.setViewport({ width: 2560, height: 1440 });

        await page.goto(websiteUrl);
        environment.setPage(page);
        environment.log.info(`Opened page at: ${websiteUrl}`);

        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Page to HTML Executor
export async function PageToHtmlExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const html = await environment.getPage()!.content();
        environment.setOutput("HTML", html);
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Extract Text From Element Executor
export async function ExtractTextFromElementExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        if (!selector) {
            environment.log.error("input-> selector not defined");
            return false;
        }

        const text = await environment.getPage()!.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error("element not found");
            }
            return element.textContent || "";
        }, selector);

        environment.setOutput("Text", text);
        environment.log.info(`Extracted text: ${text}`);
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Fill Input Executor
export async function FillInputExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        const value = environment.getInput("Value");
        await environment.getPage()!.type(selector, value);
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Click Element Executor
export async function ClickElementExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        await environment.getPage()!.click(selector);
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Wait For Element Executor
export async function WaitForElementExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        await environment.getPage()!.waitForSelector(selector);
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Deliver Via Webhook Executor
export async function DeliverViaWebhookExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const webhookUrl = environment.getInput("Webhook URL");
        const payload = environment.getInput("Payload");

        if (!webhookUrl) {
            environment.log.error("Webhook URL is required");
            return false;
        }

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload || "{}"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        environment.log.info(`Webhook delivered successfully to ${webhookUrl}`);
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Extract Data With AI Executor
export async function ExtractDataWithAiExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const html = environment.getInput("HTML");
        const prompt = environment.getInput("Prompt");

        // Mock AI processing for now
        environment.log.info("Extracting data with AI");
        environment.setOutput("Data", JSON.stringify({ result: "Extracted data would appear here" }));
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Read Property From JSON Executor
export async function ReadPropertyFromJsonExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const json = environment.getInput("JSON");
        const property = environment.getInput("Property");

        if (!json || !property) {
            environment.log.error("JSON and Property inputs are required");
            return false;
        }

        const data = JSON.parse(json);
        const value = property.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : undefined, data);

        if (value === undefined) {
            environment.log.error(`Property '${property}' not found in JSON`);
            return false;
        }

        environment.setOutput("Value", typeof value === 'object' ? JSON.stringify(value) : String(value));
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Add Property To JSON Executor
export async function AddPropertyToJsonExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const json = environment.getInput("JSON");
        const property = environment.getInput("Property");
        const value = environment.getInput("Value");

        if (!json || !property) {
            environment.log.error("JSON and Property inputs are required");
            return false;
        }

        const data = JSON.parse(json);

        // Split the property path and set the value
        const parts = property.split('.');
        let current = data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;

        environment.setOutput("JSON", JSON.stringify(data));
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Navigate URL Executor
export async function NavigateUrlExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const url = environment.getInput("URL");
        await environment.getPage()!.goto(url);
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}

// Scroll To Element Executor
export async function ScrollToElementExecutor(environment: ExecutionEnvironment<any>): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        if (!selector) {
            environment.log.error("input-> selector not defined");
        }

        await environment.getPage()!.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error("element not found");
            }

            const top = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top });
        }, selector);

        return true;
    } catch (error: unknown) {
        environment.log.error(error instanceof Error ? error.message : String(error));
        return false;
    }
}

// Export the consolidated executor registry
export const ExecutorRegistry: RegistryType = {
    LAUNCH_BROWSER: LaunchBroswerExecutor,
    PAGE_TO_HTML: PageToHtmlExecutor,
    EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementExecutor,
    FILL_INPUT: FillInputExecutor,
    CLICK_ELEMENT: ClickElementExecutor,
    WAIT_FOR_ELEMENT: WaitForElementExecutor,
    DELIVER_VIA_WEBHOOK: DeliverViaWebhookExecutor,
    EXTRACT_DATA_WITH_AI: ExtractDataWithAiExecutor,
    READ_PROPERTY_FROM_JSON: ReadPropertyFromJsonExecutor,
    ADD_PROPERTY_TO_JSON: AddPropertyToJsonExecutor,
    NAVIGATE_URL: NavigateUrlExecutor,
    SCROLL_To_ELEMENT: ScrollToElementExecutor,
}; 