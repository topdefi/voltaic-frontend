export function trackById(_, item: { id: number }): number {
    return item.id;
}

export function patchTrackIds(list: any[]): any[] {
    if (list?.forEach) {
        list.forEach(item => {
            if (item && !item.id) {
                item.id = `${Date.now()}_${Math.random()}`;
            }
        });
    }

    return list;
}

export function trackBySelf<T>(_, item: T): T {
    return item;
}

export function trackByValue<T>(_, item: { value: T }): T {
    return item.value;
}
