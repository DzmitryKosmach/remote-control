import { RawData, WebSocket } from "ws";
import robot from "robotjs";
import Jimp from "jimp";
import { Commands } from "./command";
import {
  drawCircle,
  drawRectangle,
  performWithLeftMouseButton,
  screenCaptureToFile,
} from "./drawRobotJs";

export const performCommand = async (data: RawData, ws: WebSocket) => {
  try {
    //https://github.com/websockets/ws
    /* const messageStream = createWebSocketStream(ws, {
      encoding: "utf8",
      objectMode: true,
      writableObjectMode: true,
    }); */

    //messageStream.pipe(ws.);

    const { command, firstParam, secondParam } = parseParams(data);
    switch (command) {
      case Commands.DRAW_CIRCLE:
        //await getUsers(req, res);
        const radius = firstParam!;
        ws.send(Commands.DRAW_CIRCLE);
        performWithLeftMouseButton(drawCircle, radius);
        break;

      case Commands.DRAW_RECTANGLE:
        const widthRect = firstParam!;
        const heightRect = secondParam!;
        ws.send(Commands.DRAW_RECTANGLE);
        performWithLeftMouseButton(drawRectangle, widthRect, heightRect);
        break;

      case Commands.DRAW_SQUARE:
        const widthSquare = firstParam!;
        ws.send(Commands.DRAW_SQUARE);
        performWithLeftMouseButton(drawRectangle, widthSquare, widthSquare);
        break;

      case Commands.MOUSE_POSITION:
        const mousePosition = robot.getMousePos();
        const resMousePosition = `${Commands.MOUSE_POSITION} ${mousePosition.x},${mousePosition.y}`;
        ws.send(resMousePosition);
        break;

      case Commands.MOUSE_UP:
        const offsetUp = firstParam!;
        const mousePositionUp = robot.getMousePos();
        robot.moveMouse(mousePositionUp.x, mousePositionUp.y - offsetUp);
        ws.send(Commands.MOUSE_UP);
        break;

      case Commands.MOUSE_DOWN:
        const offsetDown = firstParam!;
        const mousePositionDown = robot.getMousePos();
        robot.moveMouse(mousePositionDown.x, mousePositionDown.y + offsetDown);
        ws.send(Commands.MOUSE_DOWN);
        break;

      case Commands.MOUSE_RIGHT:
        const offsetRight = firstParam!;
        const mousePositionRight = robot.getMousePos();
        robot.moveMouse(
          mousePositionRight.x + offsetRight,
          mousePositionRight.y
        );
        ws.send(Commands.MOUSE_RIGHT);
        break;

      case Commands.MOUSE_LEFT:
        const offsetLeft = firstParam!;
        const mousePositionLef = robot.getMousePos();
        robot.moveMouse(mousePositionLef.x - offsetLeft, mousePositionLef.y);
        ws.send(Commands.MOUSE_LEFT);
        break;

      case Commands.PRINT_SCREEN:
        const size = 200;
        const mousePositionPrnScrn = robot.getMousePos();
        const img = robot.screen.capture(
          mousePositionPrnScrn.x,
          mousePositionPrnScrn.y,
          size,
          size
        );
        await screenCaptureToFile(img, "temp.png");
        const imageBufferBase64 = (await (await Jimp.read("temp.png"))
          .getBase64Async(Jimp.MIME_PNG)
          .catch((err) => {
            console.log(err.message);
          }))!;
        ws.send(`${Commands.PRINT_SCREEN} ${imageBufferBase64.split(",")[1]}`);
        break;
    }
  } catch (error) {
    console.error((error as Error).message);
  }
};

function parseParams(data: RawData): CommandParams {
  const arrayParams = data.toString().split(" ");
  return {
    command: arrayParams[0] ? arrayParams[0] : "",
    firstParam: arrayParams[1] ? +arrayParams[1] : undefined,
    secondParam: arrayParams[2] ? +arrayParams[2] : undefined,
  };
}

type CommandParams = {
  command: string;
  firstParam?: number;
  secondParam?: number;
};
