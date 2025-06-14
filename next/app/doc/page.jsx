import ApiBlock from "./components/apiBlock";
import MqttBlock from "./components/mqttBlock";
import UrlBadge from "./components/urlBadge";

export default function page() {
    return (
        <div className="min-h-screen flex items-start justify-center px-4 py-8">
            <div className="w-full max-w-4xl space-y-8">
                <h1 className="text-2xl">
                    如何實作：同一題的restful
                    api或action擇一實作即可，任何return
                    null的action視為未實作，這時會自動改為呼叫api。
                </h1>
                <h1 className="text-2xl">
                    api實作說明：會將資料傳入body，請根據body的資料完成指定動作。某些url有類似
                    ":" 的路徑，代表的就是param( ex. :menuId {"=>"} [menuId] )。
                </h1>
                <h1 className="text-2xl mb-5">
                    action說明：
                    若該題有body，則會將body傳入第一個參數(ex.1)。若該題有param，則會看有沒有body後決定填入第一或第二個參數(ex.2,
                    ex.3)
                </h1>
                <h1 className="text-2xl mb-0">
                    ex.1 只有body:
                    <UrlBadge text={`addOrder(body);`} />
                </h1>
                <h1 className="text-2xl mb-0">
                    ex.2 body, params 皆有:
                    <UrlBadge text={`editOrderStatus(body, orderId);`} />
                </h1>
                <h1 className="text-2xl mb-0">
                    ex.3 只有param:
                    <UrlBadge text={`getCustomerOrder(customerId);`} />
                </h1>
                <h1 className="text-2xl">
                    ex.4 皆沒有:
                    <UrlBadge text={`getPendingOrders();`} />
                </h1>
                <h1 className="text-2xl mb-0">實作MQTT步驟說明：</h1>
                <h1 className="text-2xl mb-0">
                    1.在指定的地方呼叫
                    <UrlBadge text={`publishMessage(topic, message)`} />
                </h1>
                <h1 className="text-2xl">
                    2. 指定的topic都可以在"/utils/mqttTopic.ts"找到。
                </h1>
                <h1 className="text-2xl mb-1">
                    ex. 若要實作 /chekcout 頁面的
                    <UrlBadge text={`getOrderCheckoutTopic();`} />
                </h1>
                <h1 className="text-2xl mb-1">
                    <UrlBadge
                        text={`import { getOrderCheckoutTopic } from "@/utils/mqttTopic";`}
                    />
                </h1>
                <h1 className="text-2xl mb-1">
                    然後
                    <UrlBadge text={`const topic = getOrderCheckoutTopic();`} />
                </h1>
                <h1 className="text-2xl">
                    並呼叫
                    <UrlBadge
                        text={`publishMessage(topic, JSON.stringify(your_message_object));`}
                    />
                </h1>
                <div className="mb-40" />
                <ApiBlock
                    apiName={"管理員上傳菜單圖片 ( 2分 )"}
                    apiDescription={
                        "在 /admin/menu 上傳圖片。對應的action：uploadMenuImage"
                    }
                    bodyDescription={`body是formData，欄位名稱是"file"`}
                    responseDescription={`可利用try catch，把失敗的api回傳為"success": false`}
                    apiType={"post"}
                    apiUrl={"/api/image/upload"}
                    bodyObj={{
                        file: "上傳的圖片",
                    }}
                    responseObj={{
                        success: true,
                        url: "imgUrl",
                    }}
                />
                <ApiBlock
                    apiName={"管理員新增菜單( 1分 )"}
                    apiDescription={
                        "在 /admin/menu 新增菜單。對應的action：addMenuItem"
                    }
                    apiType={"post"}
                    apiUrl={"/api/menu"}
                    bodyObj={{
                        name: "餐點名稱",
                        description: "餐點敘述",
                        price: 50,
                        imageUrl: "imgUrl",
                        isAvailable: true,
                    }}
                    responseObj={{
                        id: "menuId",
                        name: "餐點名稱",
                        description: "餐點敘述",
                        price: 50,
                        imageUrl: "imgUrl",
                        isAvailable: true,
                    }}
                />
                <ApiBlock
                    apiName={"管理員編輯菜單( 1分 )"}
                    apiDescription={`在 /admin/menu 編輯菜單。對應的action：editMenuItem`}
                    apiType={"put"}
                    apiUrl={"/api/menu/:menuId"}
                    bodyObj={{
                        name: "新餐點名稱",
                        description: "新餐點敘述",
                        price: 35,
                        imageUrl: "newImgUrl",
                        isAvailable: true,
                    }}
                    responseObj={{
                        id: "menuId",
                        name: "新餐點名稱",
                        description: "新餐點敘述",
                        price: 35,
                        imageUrl: "newImgUrl",
                        isAvailable: true,
                    }}
                />
                <ApiBlock
                    apiName={"取得所有菜單( 1分 )"}
                    apiDescription={`在 /admin/menu 和 /menu 取得菜單。對應的action：getMenuItems`}
                    apiType={"get"}
                    apiUrl={"/api/menu"}
                    responseObj={[
                        {
                            id: "menuItemId",
                            name: "餐點名稱",
                            description: "餐點敘述",
                            price: 35,
                            imageUrl: "imgUrl",
                            isAvailable: true,
                        },
                    ]}
                />
                <ApiBlock
                    apiName={"顧客下單( 2分 )"}
                    apiDescription={
                        "在 /checkout 下單。依照body新增一筆order及對應的orderItems。對應的action：addOrder"
                    }
                    apiType={"post"}
                    apiUrl={"/api/orders"}
                    bodyObj={{
                        customerId: "customerId",
                        orderItems: [
                            {
                                menuItemId: "menuItemId",
                                quantity: 1,
                                specialRequest: "備註",
                            },
                        ],
                    }}
                    responseObj={{
                        id: "orderId",
                        customerId: "customerId",
                        totalAmount: 35,
                        customer: {
                            name: "customerName",
                        },
                        items: [
                            {
                                menuItemId: "menuItemId",
                                quantity: 1,
                                specialRequest: "餐點備註",
                                menuItem: {
                                    name: "餐點名稱",
                                    price: 35,
                                },
                            },
                        ],
                        status: "PENDING",
                        createdAt: "2025-06-10T14:19:40.204Z",
                    }}
                />
                <MqttBlock
                    apiName={"顧客下單(2分)"}
                    apiDescription={
                        "在 /checkout 實作，staff就可以即時收到訂單更新。"
                    }
                    apiUrl={"topic: getOrderCheckoutTopic();"}
                    messageObj={{
                        id: "orderId",
                        customerId: "customerId",
                        totalAmount: 35,
                        customer: {
                            name: "customerName",
                        },
                        items: [
                            {
                                menuItemId: "menuItemId",
                                quantity: 1,
                                specialRequest: "餐點備註",
                                menuItem: {
                                    name: "餐點名稱",
                                    price: 35,
                                },
                            },
                        ],
                        status: "PENDING",
                        createdAt: "2025-06-10T14:19:40.204Z",
                    }}
                    messageDescription={"顧客下單api的response就是message"}
                />
                <ApiBlock
                    apiName={"取得顧客訂單( 2分 )"}
                    apiType={"get"}
                    apiDescription={
                        "在 /orders 取得顧客訂單。對應的action：getCustomerOrder"
                    }
                    apiUrl={"/api/orders/customers/:customerId"}
                    responseObj={[
                        {
                            id: "orderid",
                            customerId: "customerId",
                            status: "PENDING",
                            totalAmount: 80,
                            createdAt: "2025-06-07T06:58:35.725Z",
                            items: [
                                {
                                    id: "orderItemId",
                                    orderId: "orderId",
                                    menuItemId: "menuItemId",
                                    quantity: 1,
                                    specialRequest: "餐點備註",
                                    createdAt: "2025-06-07T06:58:35.725Z",
                                    menuItem: {
                                        name: "餐點名稱",
                                        price: 35,
                                    },
                                },
                            ],
                        },
                    ]}
                    responseDescription={`nested relations prisma 提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                <ApiBlock
                    apiName={"根據status更改訂單狀態( 1分 )"}
                    apiDescription={
                        "在訂單狀態更改時呼叫。對應的action：editOrderStatus"
                    }
                    apiType={"patch"}
                    apiUrl={"/api/orders/:orderId/status"}
                    bodyObj={{ status: "PENDING" }}
                    responseObj={{}}
                    responseDescription={`成功時回傳空物件即可`}
                />
                <MqttBlock
                    apiName={"接受訂單，傳送通知給顧客 ( 2分 )"}
                    apiDescription={
                        "在 /pending 頁面實作。顧客就能即時收到通知。"
                    }
                    apiUrl={"topic: getAcceptCustomerOrderTopic(customerId);"}
                    messageObj={{
                        id: ` notificationRes.id `,
                        title: "訂單",
                        type: "order",
                        content: " 訂單 ${orderId.slice(0, 8)} 正在製作中 ",
                        read: false,
                        time: " new Date().toLocaleString() ",
                        status: "PREPARING",
                        orderId: " orderId ",
                    }}
                    messageDescription={
                        "除了title，type，read，status不用改以外，其他稍微修正一下就可以了"
                    }
                />
                <MqttBlock
                    apiName={"接受訂單，傳送通知給廚房 ( 2分 )"}
                    apiDescription={
                        "在 /pending 頁面實作。廚房就能即時收到訂單。"
                    }
                    apiUrl={"topic: getKitchenOrderTopic();"}
                    messageObj={{
                        id: "orderId",
                        customerId: "customerId",
                        status: "PENDING",
                        totalAmount: 35,
                        createdAt: "2025-06-11T06:17:58.171Z",
                        customer: {
                            name: "customerName",
                        },
                        items: [
                            {
                                id: "orderItemId",
                                quantity: 1,
                                specialRequest: null,
                                createdAt: "2025-06-11T06:17:58.171Z",
                                menuItem: {
                                    name: "餐點名稱",
                                    price: 35,
                                },
                            },
                        ],
                    }}
                    messageDescription={
                        "這一筆message其實就是其中一筆order。使用orders.find就可以找到了"
                    }
                />
                <ApiBlock
                    apiName={"取得所有待處理訂單( 2分 )"}
                    apiDescription={
                        "在 /orders/pending 取得待處理訂單。對應的action：getPendingOrders"
                    }
                    apiType={"get"}
                    apiUrl={"/api/orders/pending"}
                    responseObj={[
                        {
                            id: "orderId",
                            customerId: "customerId",
                            status: "PENDING",
                            totalAmount: 80,
                            createdAt: "2025-06-07T06:58:35.725Z",
                            customer: {
                                name: "customerName",
                            },
                            items: [
                                {
                                    id: "orderItemId",
                                    quantity: 1,
                                    specialRequest: null,
                                    createdAt: "2025-06-07T06:58:35.725Z",
                                    menuItem: {
                                        name: "經典蛋餅",
                                        price: 35,
                                    },
                                },
                            ],
                        },
                    ]}
                    responseDescription={`nested relations prisma 提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                <ApiBlock
                    apiName={"新增通知( 1分 )"}
                    apiDescription={
                        "在訂單變成PREPARING/READY時會呼叫。對應的action：addNotification"
                    }
                    apiType={"post"}
                    apiUrl={"/api/notifications/users/:userId"}
                    bodyObj={{
                        orderId: "orderId",
                        message: "訊息內容",
                    }}
                    responseObj={{
                        id: "notificationId",
                        userId: "userId",
                        orderId: "orderId",
                        message: "訊息內容",
                        isRead: false,
                        createdAt: "2025-06-10T17:26:58.507Z",
                        items: [
                            {
                                menuItem: {
                                    id: "menuItemId",
                                    name: "經典蛋餅",
                                },
                                quantity: 1,
                                specialRequest: null,
                            },
                        ],
                        customer: {
                            name: "customerName",
                        },
                    }}
                    responseDescription={`先notification.create再order.findUnique，然後把兩個資料整理後回傳。`}
                />
                <ApiBlock
                    apiName={"取得使用者通知( 1分 )"}
                    apiDescription={
                        "在 hook/useNotifications呼叫。對應的action：getUserNotification"
                    }
                    apiType={"get"}
                    apiUrl={"/api/notifications/users/:userId"}
                    responseObj={[
                        {
                            id: "notificationId",
                            userId: "userId",
                            orderId: "orderId",
                            message: "message content",
                            isRead: false,
                            createdAt: "2025-06-08T09:17:50.558Z",
                        },
                    ]}
                />
                <ApiBlock
                    apiName={"刪除通知( 1分 )"}
                    apiDescription={
                        "在component/notifyButton呼叫。對應action：deleteNotification"
                    }
                    apiType={"delete"}
                    apiUrl={"/api/notifications/:notificationId"}
                    responseObj={{}}
                    responseDescription={`成功時回傳空物件即可`}
                />
                <ApiBlock
                    apiName={"取得廚房訂單( 2分 )"}
                    apiDescription={
                        "在 /kitchen 取得廚房訂單。對應action：getKitchenOrders"
                    }
                    apiType={"get"}
                    apiUrl={"/api/orders/kitchen"}
                    responseObj={[
                        {
                            id: "orderId",
                            customerId: "customerId",
                            status: "PREPARING",
                            totalAmount: 80,
                            createdAt: "2025-06-07T06:58:35.725Z",
                            items: [
                                {
                                    id: "orderItemId",
                                    quantity: 1,
                                    specialRequest: "餐點備註",
                                    menuItem: {
                                        id: "menuItemId",
                                        name: "餐點名稱",
                                        description: "餐點敘述",
                                        price: 35,
                                        imageUrl: "imgUrl",
                                        isAvailable: true,
                                    },
                                },
                            ],
                        },
                    ]}
                    responseDescription={`nested relations prisma 提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                <ApiBlock
                    apiName={"取得製作完成的訂單( 2分 )"}
                    apiDescription={
                        "在 /orders/ready 取得完成的訂單。對應的action：getReadyOrders"
                    }
                    apiType={"get"}
                    apiUrl={"/api/orders/ready"}
                    responseObj={[
                        {
                            id: "orderId",
                            status: "READY",
                            totalAmount: 80,
                            createdAt: "2025-06-08T09:17:33.585Z",
                            customer: {
                                name: "customerName",
                            },
                            items: [
                                {
                                    id: "orderItemId",
                                    quantity: 1,
                                    specialRequest: "餐點備註",
                                    menuItem: {
                                        name: "餐點名稱",
                                        price: 45,
                                    },
                                },
                            ],
                        },
                    ]}
                    responseDescription={`nested relations prisma提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                <ApiBlock
                    apiName={"獲取訂單資訊 ( 1分 )"}
                    apiDescription={
                        "在 /orders/ready 取得訂單詳細資訊。對應的action：getOrderById"
                    }
                    apiType={"get"}
                    apiUrl={"/api/orders/:orderId"}
                    responseObj={{
                        id: "orderId",
                        customerId: "customerId",
                        status: "COMPLETED",
                        totalAmount: 35,
                        createdAt: "2025-06-10T17:26:44.590Z",
                        updatedAt: "2025-06-10T17:32:29.246Z",
                        paymentStatus: false,
                        completedAt: null,
                        items: [
                            {
                                id: "orderItemId",
                                orderId: "orderId",
                                menuItemId: "menuItemId",
                                quantity: 1,
                                specialRequest: null,
                                createdAt: "2025-06-10T17:26:44.590Z",
                            },
                        ],
                        customer: {
                            id: "customerId",
                            email: "customer@gmail.com",
                            emailVerified: null,
                            name: "customerName",
                            password: "password",
                            role: "CUSTOMER",
                            image: null,
                            createdAt: "2025-05-27T23:29:40.605Z",
                            updatedAt: "2025-05-27T23:29:40.605Z",
                        },
                    }}
                />
            </div>
        </div>
    );
}
