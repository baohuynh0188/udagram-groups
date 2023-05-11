import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log("Caller event", event);

    const groupId = event.pathParameters.groupId;
    const validGroupId = await groupExists(groupId);

    if (!validGroupId) {
        return {
            statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                error: "Group does not exist",
            }),
        };
    }

    const images = await getImagesPerGroup(groupId);

    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            items: images,
        }),
    };
};

const groupExists = async (groupId: string) => {
    const getParams = {
        TableName: groupsTable,
        Key: {
            id: groupId,
        },
    };
    const result = await docClient.get(getParams).promise();

    console.log("Get group: ", result);
    return !!result.Item;
};

const getImagesPerGroup = async (groupId: string) => {
    const queryParams = {
        TableName: imagesTable,
        KeyConditionExpression: "groupId = :groupId",
        ExpressionAttributeValues: {
            ":groupId": groupId,
        },
        ScanIndexForward: false,
    };
    const result = await docClient.query(queryParams).promise();

    return result.Items;
};
