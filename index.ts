import { WebSocketServer, CloseEvent, createWebSocketStream } from "ws";
import { httpServer } from "./src/http_server/index";
import { performCommand } from "./src/performCommand";
import { Messages } from "./src/constatnts";
import "dotenv/config";

const HTTP_PORT = process.env["HTTP_PORT"];
const WS_PORT = process.env["WS_PORT"] ? +process.env["WS_PORT"] : 0;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({
  port: WS_PORT,
});

//https://github.com/websockets/ws/issues/1640

wss.on("connection", async (ws) => {
  const messageStream = createWebSocketStream(ws, { encoding: "utf8" });
  //duplex.write("Web Socket Connection Is Succesful!");
  //ws.send(Messages.WS_CONNECTION_SUCCES);

  for await (let message of messageStream) {
    console.log("received: %s", message);
    performCommand(message, ws);
  }
  /* ws.on("message", (data) => {
    console.log("received: %s", data);
    performCommand(data, ws);
  }); */
});

wss.on("close", (event: CloseEvent) => {
  if (event.wasClean) {
    console.log(Messages.WS_CONNECTION_COSE_CLEAR, event.code, event.reason);
  } else {
    console.log(Messages.WS_CONNECTION_INTERAPT);
  }
});
