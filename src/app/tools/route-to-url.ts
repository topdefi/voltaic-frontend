import { EAppRoutes } from "enums/routing";

export function routeToUrl(route: EAppRoutes): string {
    return `/${route}`;
}
