import { WebSocketServer, CloseEvent } from "ws";
import { httpServer } from "./src/http_server/index";
import { performCommand } from "./src/performCommand";

const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({
  port: 8080,
});

wss.on("connection", (ws) => {
  //const duplex = createWebSocketStream(ws);
  //duplex.write("Web Socket Connection Is Succesful!");
  ws.send("Web Socket Connection Is Succesful!");

  ws.on("message", (data) => {
    console.log("received: %s", data);
    performCommand(data, ws);
  });
});

wss.on("close", (event: CloseEvent) => {
  if (event.wasClean) {
    console.log(
      `The connection is closed cleanly,  code=${event.code} reason=${event.reason}`
    );
  } else {
    console.log("The connection is interrupted");
  }
});
