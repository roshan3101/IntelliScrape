import { Environment, ExecutionEnvironment } from "@/types/executor";
import puppeteer, {} from "puppeteer"
import { LaunchBrowserTask } from "../task/LaunchBrowser";

const BROWSER_WS = "wss://brd-customer-hl_a5a3ac65-zone-intelliscrapebrowser:vu25wowy463z@brd.superproxy.io:9222"

export async function LaunchBroswerExecutor (environment: ExecutionEnvironment<typeof LaunchBrowserTask>) : Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url");
        const browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS,
        })

        environment.log.info("Browser started successfully")
        environment.setBrowser(browser);
        const page = await browser.newPage();
        page.setViewport({width: 2560, height: 1440})

        // await page
        //     .authenticate({
        //         username: "brd-customer-hl_a5a3ac65-zone-intelliscrape",
        //         password: "up423or9c4iz",
        //     })

        await page.goto(websiteUrl);
        environment.setPage(page);
        environment.log.info(`Opened page at: ${websiteUrl}`)
        
        return true;
        
    } catch (error:any) {
        environment.log.error(error.message);
        return false
    }
}