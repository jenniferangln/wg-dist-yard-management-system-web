export interface MYard {
    id:number,
    yardCode:string,
    yardName:string,
    parentYardId:number,
    yardType:string,
    yardAddress:string,
    latitude:number,
    longitude:number,
    sourceLoc:string,
    utcTimezone:number,
    createdBy?:string,
    createdAt?:string,
    updatedBy?:string,
    updatedAt?:string
}