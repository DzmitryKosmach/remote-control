import { WebSocketServer } from "ws";
//import robot from 'robotjs';
//import Jimp from 'jimp';
import { httpServer } from "./src/http_server/index";
import { performCommand } from "./src/performCommand";

const HTTP_PORT = 3000;

//robot.setMouseDelay(2);

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({
  port: 8080,
});

wss.on("connection", (ws) => {
  ws.send("Web Socket Connection Is Succesful!");

  ws.on("message", (data) => {
    console.log("received: %s", data);
    performCommand(data, ws);
    /* ws.send('mouse_up {100 px}');
        robot.moveMouse(100, 100); */
  });
});

wss.on("close", () => {
  //закрытие соединения
});
