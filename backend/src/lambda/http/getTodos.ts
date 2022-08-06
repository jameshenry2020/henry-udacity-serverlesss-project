import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getJwtToken } from '../utils';
import {getAllToDo} from "../../helpers/todos"

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // Write your code here
    const jwtToken=getJwtToken(event)
    
    const todos = await getAllToDo(jwtToken)

    return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
          "items": todos,
      }),
  }
}
)

handler.use(
  cors({
    credentials: true
  })
)
