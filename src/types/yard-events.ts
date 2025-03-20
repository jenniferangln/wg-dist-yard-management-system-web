export interface MYardEvent {
    id:number,
    yardEvent:string,
    yardEventDesc:string,
    subToKafkaTopic:string,
    createdBy?:string,
    createdAt?:string,
    updatedBy?:string,
    updatedAt?:string
}