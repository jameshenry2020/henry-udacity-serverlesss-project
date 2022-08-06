import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { parseUserId } from "../auth/utils"
const uuidv4 = require('uuid/v4');
// import * as createError from 'http-errors'

const logger = createLogger('Todos')
const toDoAccess = new TodosAccess();

export async function getAllToDo(jwtToken: string): Promise<TodoItem[]> {
    const userId=parseUserId(jwtToken)
    return toDoAccess.getToDosForUser(userId);
}

export async function createTodos(
    createTodosRequest: CreateTodoRequest,
    jwtToken: string
  ): Promise<TodoItem> {
    const itemId = uuidv4()
    const userId = parseUserId(jwtToken);
    logger.info(itemId);
    const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
  
    return await toDoAccess.createTodos({
      createdAt: new Date().toISOString(),
      todoId: itemId,
      userId: userId,
      attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${itemId}`,
      done: false,
      ...createTodosRequest,
    })
  }

  export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.updateTodos(userId, todoId,  updateTodoRequest );
}

export function deleteToDo(todoId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.deleteTodos(todoId, userId);
}

export function createAttachmentPresignedUrl(todoId: string): Promise<string> {
    return toDoAccess.generateUploadUrl(todoId);
}