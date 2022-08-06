import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Types } from 'aws-sdk/clients/s3';
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

// const XAWS = AWSXRay.captureAWS(AWS)
// const AWSXRay = require('aws-xray-sdk')


const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
      private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
      private readonly todoTable = process.env.TODOS_TABLE,
      private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
      private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET
      ) {
      
      }
     
      async getToDosForUser(userId: string): Promise<TodoItem[]> {
        const params = {
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }
        const response = await this.docClient.query(params).promise();
        console.log(response);
        const items = response.Items;

        return items as TodoItem[]
    };

        async createTodos(todos: TodoItem): Promise<TodoItem> {
                await this.docClient.put({
                TableName: this.todoTable,
                Item: todos
                }).promise()

                logger.info("todo created", todos)
                return todos;
                };

        async updateTodos(userId: string, todoId: string, todos: TodoUpdate): Promise<TodoUpdate> {
            const params = {
                TableName: this.todoTable,
                Key: {
                    "userId": userId,
                    "todoId": todoId
                },
                UpdateExpression: "set #a = :a, #b = :b, #c = :c",
                ExpressionAttributeNames: {
                    "#a": "name",
                    "#b": "dueDate",
                    "#c": "done"
                },
                ExpressionAttributeValues: {
                    ":a": todos['name'],
                    ":b": todos['dueDate'],
                    ":c": todos['done']
                },
                ReturnValues: "ALL_NEW"
            }
        
            const result = await this.docClient.update(params).promise();
            console.log(result);
            const attributes = result.Attributes;
        
            return attributes as TodoUpdate;
            }

  async generateUploadUrl(todoId: string): Promise<string> {
      console.log("Generating URL");

      const s3url = this.s3Client.getSignedUrl('putObject', {
          Bucket: this.s3BucketName,
          Key: todoId,
          Expires: 1000,
      })
      
      return s3url as string;
  }
  async deleteTodos(userId: String, todoId: String): Promise<string> {
      console.log("deleting todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(params).promise();
        console.log(result);

        return "" as string;
    }
}