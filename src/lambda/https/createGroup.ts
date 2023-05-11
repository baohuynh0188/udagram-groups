import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const docClient = new AWS.DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log("Processing event: ", event);
    const itemId = uuidv4();
    const parsedBody = JSON.parse(event.body);

    const newItem = {
        id: itemId,
        ...parsedBody,
    };

    const putParams = {
        TableName: groupsTable,
        Item: newItem,
    };

    await docClient.put(putParams).promise();

    // Return result
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            newItem,
        }),
    };
};
