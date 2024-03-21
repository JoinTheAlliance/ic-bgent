import { BgentRuntime, Content, Message, SqlJsDatabaseAdapter, State, composeContext, embeddingZeroVector, messageHandlerTemplate, parseJSONObjectFromText, zeroUuid, zeroUuidPlus1 } from 'bgent';
import express from 'express';
import initSqlJs from 'sql.js/dist/sql-asm.js';
import form from './form';

const key = "r9ynLtE17NMA1Ok43rpT3BlbkFJ8479vQYcAh3Z6J0SXkNu";

/**
 * Handle an incoming message, processing it and returning a response.
 * @param message The message to handle.
 * @param state The state of the agent.
 * @returns The response to the message.
 */

async function handleMessage(
  runtime: BgentRuntime,
  message: Message,
  state?: State
) {
  const _saveRequestMessage = async (message: Message, state: State) => {
    const { content, userId, room_id } = message;
    if (content) {
      console.log("Create memory")
      await runtime.databaseAdapter.createMemory({
        user_id: userId!,
        content,
        room_id,
        embedding: embeddingZeroVector,
      }, "messages", false);
      console.log('evaluating')
      await runtime.evaluate(message, state);
    }
  };

  console.log('saving request message')
  await _saveRequestMessage(message, state as State);
  console.log('getting state', state);

  if (!state) {
    state = (await runtime.composeState(message)) as State;
  }

  console.log('composing context');
  const context = composeContext({
    state,
    template: messageHandlerTemplate,
  });

  let responseContent: Content | null = null;
  const { userId, room_id } = message;

  for (let triesLeft = 3; triesLeft > 0; triesLeft--) {
    console.log('running completion')
    const response = await runtime.completion({
      context,
      stop: [],
    });
    console.log('response', response);

    runtime.databaseAdapter.log({
      body: { message, context, response },
      user_id: userId,
      room_id,
      type: "simple_agent_main_completion",
    });

    console.log('parsing response')
    const parsedResponse = parseJSONObjectFromText(
      response
    ) as unknown as Content;

    if ((parsedResponse.user as string)?.includes(
      (state as State).agentName as string
    )) {
      responseContent = {
        content: parsedResponse.content,
        action: parsedResponse.action,
      };
      break;
    }
  }

  if (!responseContent) {
    responseContent = {
      content: "",
      action: "IGNORE",
    };
  }

  const _saveResponseMessage = async (
    message: Message,
    state: State,
    responseContent: Content
  ) => {
    const { room_id } = message;

    responseContent.content = responseContent.content?.trim();

    if (responseContent.content) {
      await runtime.databaseAdapter.createMemory({
        user_id: runtime.agentId,
        content: responseContent,
        room_id,
        embedding: embeddingZeroVector,
      }, "messages", false);
      await runtime.evaluate(message, { ...state, responseContent });
    } else {
      console.warn("Empty response, skipping");
    }
  };

  await _saveResponseMessage(message, state, responseContent);
  await runtime.processActions(message, responseContent);

  return responseContent;
}



export const setupServer = async (fetch: unknown | typeof globalThis.fetch, port: number | undefined = undefined) => {
  console.log("Init express")
  const app = express();
  console.log("Init sql.js")
  const SQL = await initSqlJs({});
  console.log("Creating database adapter")
  const db = new SQL.Database();
  const adapter = new SqlJsDatabaseAdapter(db as any);
console.log("Define decrypt")
  // Decryption function

console.log("Init runtime")
  const runtime = new BgentRuntime({
    fetch: fetch,
    serverUrl: "https://api.openai.com/v1",
    databaseAdapter: adapter,
    token: 'sk-T' + key,
  });

  console.log("Creating account")
  // if account doesn't exist with zeroUuidPlus1, create it
  let accountExists = false;
  let zeroUuidPlus1Account = null;
  try {
    zeroUuidPlus1Account = await runtime.databaseAdapter.getAccountById(zeroUuidPlus1);
    if (zeroUuidPlus1Account) {
      accountExists = true;
    }
  } catch (error) {
    console.log("Accounts table not created yet")
  }
  
  if (!zeroUuidPlus1Account) {
    await runtime.databaseAdapter.createAccount({
      id: zeroUuidPlus1,
      name: "Zero",
      email: "testaccount2@test.com"
    });
  }
  console.log("Account created")

  app.get('/', async (req, res) => {
    console.log('sending form')
    res.send(form);
  });

  app.get('/message', async (req, res) => {
    console.log('handling message')
    try {

      // Get the message from the request
      const { message } = req.query;
      if (!message) {
        throw new Error('No message provided');
      }

      // Create a message object
      const messageObject = {
        content: { content: message as string, action: "WAIT" },
        userId: zeroUuidPlus1,
        room_id: zeroUuid,
      };

      // Handle the message
      const response = await handleMessage(runtime, messageObject);
      console.log(response);

      // Send the response
      res.send(JSON.stringify(response.content));
    } catch (error) {
      console.error(error);
    }
  });
  console.log("Listening")
  console.log("Listening on port" + port)
  if(port) return app.listen(port);
  return app.listen();
};
