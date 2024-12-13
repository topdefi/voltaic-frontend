export function toStringArray(eNum: any): string[] {
    return Object.keys(eNum).filter(source => isNaN(+source));
}

export function toValueArray<T = string>(eNum: any): T[] {
    return toStringArray(eNum).map(key => eNum[key]);
}
