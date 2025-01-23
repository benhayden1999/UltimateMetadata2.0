import { handleUpdate } from "./src/index.js";

export const handler = async (event) => {
  try {
    const body = JSON.stringify(event);
    await handleUpdate(body);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Hello World" }),
    };
  } catch (error) {
    console.log("Error processing update", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

//Local testing
const testEvent = {
  body: JSON.stringify({ message: "hello", username: "benhayden" }),
};

(async () => {
  const lambdaResponse = await handler(testEvent);
  console.log(lambdaResponse);
})();
