import robot from "robotjs";
import Jimp from "jimp";

const offsetMouseDraw = 0.01;
robot.setMouseDelay(1);

function drawCircle(radius: number) {
  robot.mouseToggle("up");
  const mousePos = robot.getMousePos();
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

export {
  drawCircle,
  drawRectangle,
  performWithLeftMouseButton,
  screenCaptureToFile,
};
