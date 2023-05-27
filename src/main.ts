import axios from "axios";
import { ApiResponse } from "./api-response";
import { FullItem } from "./full-item";
import { FullItemApiPayload } from "./full-item-api-response";
import { ItemsPayload } from "./item_api_response";
import { OrdersPayload } from "./order-payload";
import { getCheapestPrice } from "./get-cheapest-price";
const fs = require('fs');
main();
async function main() {
    const { default: delay } = await import("delay");

    let itemApiResponse = await axios.get<ApiResponse<ItemsPayload>>('https://api.warframe.market/v1/items');
    let allItems = itemApiResponse.data.payload.items
    let setsItems = allItems.filter((item) => item.url_name.endsWith('set'));
    setsItems = setsItems.slice(0, 4);
    //     console.dir(setsItems)
    //     const firstElement = setsItems[0]
    //     let a = await axios.get(`https://api.warframe.market/v1/items/${firstElement.url_name}`);
    // console.log (`vadsv`)
    //     console.dir( a.data.payload.item , {depth:50})
    // return setsItemsInfo.data.payload.items
    let itemsFullInfoApiResponse = setsItems.map(async (setItem, index) => {
        await delay((1000 / 3) * index)
        let setsItemsInfo = await axios.get<ApiResponse<FullItemApiPayload>>(`https://api.warframe.market/v1/items/${setItem.url_name}`);
        return setsItemsInfo.data.payload.item
    });
    let setItemArray = await Promise.all(itemsFullInfoApiResponse);
    // console.dir(Object.keys(a [0 1]) , {depth:50})

    const redundantLanguageKeys = [
        'ru',
        'ko',
        'fr',
        'sv',
        'de',
        'zh-hant',
        'zh-hans',
        'pt',
        'es',
        'pl',
        'cs',
        'uk',
    ];

    let itemsInSetArray = setItemArray.map((setItem) => {
        const itemsInSet = setItem.items_in_set.map((item) => {
            for (const redundantLanguageKey of redundantLanguageKeys) {
                delete item[redundantLanguageKey as keyof FullItem]
            };
            return item;
        });
        return itemsInSet
    })

    // fs.writeFileSync('./itemsFull.txt', JSON.stringify(setItemArray));
    // console.log(Object.keys(setItemArray[0].items_in_set[0]));

    for (const itemsInSet of itemsInSetArray) {
        const setItem = itemsInSet.find((item) => item.url_name.endsWith('set'));
        let cheapestSetOrder = await getCheapestPrice(setItem!.url_name)
        let subItems = itemsInSet.filter((item) => item != setItem);
        let cheapestSubItemOrder = await Promise.all(
            subItems.map(async (subItem , index) => {
                await delay ( (1000/3) * index);
                return await getCheapestPrice (subItem!.url_name);
            })
        );
        let subItemsPriceSum = cheapestSubItemOrder.reduce((accumulator, curentValue) => accumulator + curentValue , 0);
        let difference = cheapestSetOrder - subItemsPriceSum;
        console.log(difference , setItem?.url_name);
    };































}