import { RawData, WebSocket } from "ws";
import robot from "robotjs";
import Jimp from "jimp";
import { Commands } from "./command";
//import Jimp from "jimp/*";

robot.setMouseDelay(1);
const offsetMouseDraw = 0.01;
const END_COMMAND = "\0";

export const performCommand = async (data: RawData, ws: WebSocket) => {
  try {
    //const duplex = createWebSocketStream(ws)
    const { command, firstParam, secondParam } = parseParams(data);
    switch (command) {
      case Commands.DRAW_CIRCLE:
        //await getUsers(req, res);
        const radius = firstParam!;
        ws.send(Commands.DRAW_CIRCLE + END_COMMAND);
        performWithLeftMouseButton(drawCircle, radius);
        break;

      case Commands.DRAW_RECTANGLE:
        const widthRect = firstParam!;
        const heightRect = secondParam!;
        ws.send(Commands.DRAW_RECTANGLE + END_COMMAND);
        performWithLeftMouseButton(drawRectangle, widthRect, heightRect);
        break;

      case Commands.DRAW_SQUARE:
        const widthSquare = firstParam!;
        ws.send(Commands.DRAW_SQUARE + END_COMMAND);
        performWithLeftMouseButton(drawRectangle, widthSquare, widthSquare);
        break;

      case Commands.MOUSE_POSITION:
        const mousePosition = robot.getMousePos();
        const resMousePosition = `${Commands.MOUSE_POSITION} {${mousePosition.x}},{${mousePosition.y}}`;
        ws.send(resMousePosition + END_COMMAND);
        break;

      case Commands.MOUSE_UP:
        const offsetUp = firstParam!;
        const mousePositionUp = robot.getMousePos();
        robot.moveMouse(mousePositionUp.x, mousePositionUp.y - offsetUp);
        ws.send(Commands.MOUSE_UP + END_COMMAND);
        break;

      case Commands.MOUSE_DOWN:
        const offsetDown = firstParam!;
        const mousePositionDown = robot.getMousePos();
        robot.moveMouse(mousePositionDown.x, mousePositionDown.y + offsetDown);
        ws.send(Commands.MOUSE_DOWN + END_COMMAND);
        break;

      case Commands.MOUSE_RIGHT:
        const offsetRight = firstParam!;
        const mousePositionRight = robot.getMousePos();
        robot.moveMouse(
          mousePositionRight.x + offsetRight,
          mousePositionRight.y
        );
        ws.send(Commands.MOUSE_RIGHT + END_COMMAND);
        break;

      case Commands.MOUSE_LEFT:
        const offsetLeft = firstParam!;
        const mousePositionLef = robot.getMousePos();
        robot.moveMouse(mousePositionLef.x - offsetLeft, mousePositionLef.y);
        ws.send(Commands.MOUSE_LEFT + END_COMMAND);
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

        //const imageBuffer = await Jimp.read(img.image);

        /* const imageBuffer = await Jimp.read(img.image, function (err, image) {
          if (err) {
            console.log(err.message);
          } else {
            image.write("new-image.png");
          }
        }); */

        //https://stackoverflow.com/questions/41941151/capture-and-save-image-with-robotjs

        /* const width = size;
        const height = size;
        const imageBufferJimp = new Jimp(
          { data: img.image, width, height },
          //@ts-ignore
          (err, image) => {
            image.write("temp.png");
          }
        ); */

        await screenCaptureToFile(img, "temp.png");

        const imageBufferBase64 = (await (await Jimp.read("temp.png"))
          .getBase64Async(Jimp.MIME_PNG)
          .catch((err) => {
            console.log(err.message);
          }))!;

        //const temp = JSON.stringify(imageBufferBase64!);

        //console.log("LOG: " + temp );

        ws.send(`${Commands.PRINT_SCREEN} ${imageBufferBase64.split(",")[1]}`);

        /* const imageBuffer = Jimp.read(img.image).catch((err) => {
          console.log(err.message);
        }); */

        //@ts-ignore
        /* const imageBufferBase64 = await imageBufferJimp.getBase64Async(
          Jimp.MIME_PNG
        ); */
        //ws.send(`${Commands.PRINT_SCREEN} {${imageBufferBase64}`);

        break;

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

function screenCaptureToFile(robotBitMap: robot.Bitmap, path: string) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Jimp(robotBitMap.width, robotBitMap.height);
      let pos = 0;
      image.scan(
        0,
        0,
        image.bitmap.width,
        image.bitmap.height,
        (_, __, idx) => {
          image.bitmap.data[idx + 2] = robotBitMap.image.readUInt8(pos++);
          image.bitmap.data[idx + 1] = robotBitMap.image.readUInt8(pos++);
          image.bitmap.data[idx + 0] = robotBitMap.image.readUInt8(pos++);
          image.bitmap.data[idx + 3] = robotBitMap.image.readUInt8(pos++);
        }
      );
      image.write(path, resolve);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

type CommandParams = {
  command: string;
  firstParam?: number;
  secondParam?: number;
};
