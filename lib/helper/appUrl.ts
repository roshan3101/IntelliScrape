export function getAppUrl(path: string){
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, ''); // Remove trailing slash if present
    return `${appUrl}/${path}`;
}