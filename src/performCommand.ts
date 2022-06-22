import { RawData, WebSocket } from "ws";
import robot from "robotjs";
import { Commands } from "./command";

robot.setMouseDelay(1);
const offsetMouseDraw = 0.01;

export const performCommand = async (data: RawData, ws: WebSocket) => {
  try {
    const { command, firstParam, secondParam } = parseParams(data);
    switch (command) {
      case Commands.DRAW_CIRCLE:
        //await getUsers(req, res);
        const radius = firstParam!;
        ws.send(Commands.DRAW_CIRCLE + "\0");
        performWithLeftMouseButton(drawCircle, radius);
        break;

      case Commands.DRAW_RECTANGLE:
        const widthRect = firstParam!;
        const heightRect = secondParam!;
        ws.send(Commands.DRAW_RECTANGLE + "\0");
        performWithLeftMouseButton(drawRectangle, widthRect, heightRect);
        break;

      case Commands.DRAW_SQUARE:
        const widthSquare = firstParam!;
        ws.send(Commands.DRAW_SQUARE + "\0");
        performWithLeftMouseButton(drawRectangle, widthSquare, widthSquare);
        break;

      case Commands.MOUSE_POSITION:
        const mousePosition = robot.getMousePos();
        const resMousePosition = `mouse_position {${mousePosition.x}},{${mousePosition.y}}`;
        console.log("LOG: " + resMousePosition);
        ws.send(resMousePosition + "\0");
        break;

      case Commands.MOUSE_UP:
        const offsetUp = firstParam!;
        const mousePositionUp = robot.getMousePos();
        robot.moveMouse(mousePositionUp.x, mousePositionUp.y - offsetUp);
        ws.send(Commands.MOUSE_UP + "\0");
        break;

      case Commands.MOUSE_DOWN:
        const offsetDown = firstParam!;
        const mousePositionDown = robot.getMousePos();
        robot.moveMouse(mousePositionDown.x, mousePositionDown.y + offsetDown);
        ws.send(Commands.MOUSE_DOWN + "\0");
        break;

      case Commands.MOUSE_RIGHT:
        const offsetRight = firstParam!;
        const mousePositionRight = robot.getMousePos();
        robot.moveMouse(
          mousePositionRight.x + offsetRight,
          mousePositionRight.y
        );
        ws.send(Commands.MOUSE_RIGHT + "\0");
        break;

      case Commands.MOUSE_LEFT:
        const offsetLeft = firstParam!;
        const mousePositionLef = robot.getMousePos();
        robot.moveMouse(mousePositionLef.x - offsetLeft, mousePositionLef.y);
        ws.send(Commands.MOUSE_LEFT + "\0");
        break;

      default:
      /* res.writeHead(HTTP_STATUS_CODE_404, CONTENT_TYPE);
          res.end(JSON.stringify({ message: "Sorry, but this route not found" })); */
    }
  } catch (error) {
    /* console.error((error as Error).message);
      res.writeHead(HTTP_STATUS_CODE_500, CONTENT_TYPE);
      res.end(
        JSON.stringify({ message: "Something went wrong on th server side" })
      ); */
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

function drawCircle(radius: number) {
  robot.mouseToggle("up");
  const mousePos = robot.getMousePos();

  //robot.moveMouse(x, y);
  robot.dragMouse(mousePos.x + radius, mousePos.y);
  robot.mouseToggle("down");
  for (let i = 0; i <= Math.PI * 2; i += offsetMouseDraw) {
    const x = mousePos.x + radius * Math.cos(i);
    const y = mousePos.y + radius * Math.sin(i);

    robot.dragMouse(x, y);
  }
}

function drawRectangle(width: number, height: number) {
  drawLine(width, 0);
  drawLine(0, height);
  drawLine(-width, 0);
  drawLine(0, -height);
}

function drawLine(offsetX: number, offsetY: number) {
  const mousePos = robot.getMousePos();
  if (offsetX !== 0) {
    const _offsetX = Math.abs(offsetX);
    for (let i = 0; i <= _offsetX; i += 1) {
      const x = offsetX > 0 ? mousePos.x + i : mousePos.x - i;
      const y = mousePos.y;

      robot.dragMouse(x, y);
    }
  } else {
    const _offsetY = Math.abs(offsetY);
    for (let i = 0; i <= _offsetY; i += 1) {
      const x = mousePos.x;
      const y = offsetY > 0 ? mousePos.y + i : mousePos.y - i;

      robot.dragMouse(x, y);
    }
  }
}

function performWithLeftMouseButton(
  func: Function,
  param1: number,
  param2?: number
) {
  robot.mouseToggle("down");
  func(param1, param2);
  robot.mouseToggle("up");
}

type CommandParams = {
  command: string;
  firstParam?: number;
  secondParam?: number;
};
