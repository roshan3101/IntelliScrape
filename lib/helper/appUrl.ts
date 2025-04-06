export function getAppUrl(path: string){
    const appUrl = process.env.NEXT_PUBLLIC_APP_URL;
    return `${appUrl}/${path}}`;
}