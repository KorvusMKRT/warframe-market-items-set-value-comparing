import axios from "axios";
import { ApiResponse } from "./api-response";
import { FullItem } from "./full-item";
import { FullItemApiPayload } from "./full-item-api-response";
import { ItemsPayload } from "./item_api_response";
import { getCheapestPrice } from "./get-cheapest-price";
import fsExtra from 'fs-extra';
import { DIFFERENCES_JSON_FILE_PATH } from "./differences-json-file-path";
import { REDUNDANT_LANGUAGE_KEYS } from "./redundant-language-keys";
main();
async function main() {
    const { default: delay } = await import("delay");

    let itemApiResponse = await axios.get<ApiResponse<ItemsPayload>>('https://api.warframe.market/v1/items');
    let allItems = itemApiResponse.data.payload.items
    let setsItems = allItems.filter((item) => item.url_name.endsWith('set'));
    if (!fsExtra.pathExistsSync(DIFFERENCES_JSON_FILE_PATH)) {
        fsExtra.writeFileSync(DIFFERENCES_JSON_FILE_PATH, '{}', { encoding: "utf-8" });
    }

    setsItems.filter((setItem) => {
        let differencesJson = fsExtra.readJSONSync(DIFFERENCES_JSON_FILE_PATH);
        return (!Object.keys(differencesJson).includes(setItem!.url_name));
    })
        .map(async (setItem, index) => {
            await delay(((1000 / 3) + 1800) * index);
            let setsItemsInfo = await axios.get<ApiResponse<FullItemApiPayload>>(`https://api.warframe.market/v1/items/${setItem.url_name}`);
            return setsItemsInfo.data.payload.item
        })
        .map(async (promise) => {
            const setitem = await promise;
            return setitem.items_in_set;
        })
        .map(async (promise) => {
            const fullItemArray = await promise;
            return fullItemArray.map((item) => {
                for (const redundantLanguageKey of REDUNDANT_LANGUAGE_KEYS) {
                    delete item[redundantLanguageKey as keyof FullItem];
                };
                return item;
            });
        })

        .forEach(async (promise) => {
            const fullItemArray = await promise;
            const setItem = fullItemArray.find((item) => item.url_name.endsWith('set'));
            let cheapestSetOrder = await getCheapestPrice(setItem!.url_name)
            let subItems = fullItemArray.filter((item) => item != setItem);
            let cheapestSubItemOrder = await Promise.all(
                subItems.map(async (subItem, index) => {
                    await delay((1000 / 3) * index);
                    return await getCheapestPrice(subItem!.url_name);
                })
            );
            let differencesJson = fsExtra.readJSONSync(DIFFERENCES_JSON_FILE_PATH);
            let subItemsPriceSum = cheapestSubItemOrder.reduce((accumulator, curentValue) => accumulator + curentValue, 0);
            let difference = cheapestSetOrder - subItemsPriceSum;
            differencesJson[setItem!.url_name] = difference;
            fsExtra.writeFileSync(DIFFERENCES_JSON_FILE_PATH, JSON.stringify(differencesJson, null, 2));
        
        })



































}