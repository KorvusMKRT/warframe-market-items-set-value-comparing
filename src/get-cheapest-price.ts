import axios from "axios";
import { ApiResponse } from "./api-response";
import { OrdersPayload } from "./order-payload";
import { promises } from "dns";

export async function getCheapestPrice(urlName:string): Promise <number> {
    let ordersApiResponse = await axios.get<ApiResponse<OrdersPayload>>(`https://api.warframe.market/v1/items/${urlName}/orders`);
    let sortOrders = ordersApiResponse.data.payload.orders
    sortOrders = sortOrders.sort((order1, order2) => {
        return order1.platinum - order2.platinum;
    })
    return sortOrders[0].platinum;
}