import { WidgetTypes } from "./constants";

// Helper function to get the next available position for a widget
export const getNextPosition = (layout, width, cols) => {
  const positionsTaken = layout.map(item => ({
    startX: item.x,
    endX: item.x + item.w,
    y: item.y,
    h: item.h
  }));

  // Sort positions by Y, then by X
  positionsTaken.sort((a, b) => a.y - b.y || a.startX - b.startX);

  let nextX = 0;
  let nextY = 0;
  let foundPosition = false;

  for (let y = 0; !foundPosition; ++y) {
    for (let x = 0; x <= cols - width; x++) {
      const spaceFound = positionsTaken.every(pos => {
        const isBelow = y >= pos.y + pos.h;
        const isAbove = y + 1 <= pos.y;
        const isLeft = x + width <= pos.startX;
        const isRight = x >= pos.endX;
        return isBelow || isAbove || isLeft || isRight;
      });

      if (spaceFound) {
        nextX = x;
        nextY = y;
        foundPosition = true;
        break;
      }
    }

    if (!foundPosition) {
      nextY = y + 1;
    }
  }

  console.log(`Next position found: x=${nextX}, y=${nextY}`);
  return { x: nextX, y: nextY };
};

// Generate a layout for the new widget.
export const generateLayout = (widget, currentLayout, cols) => {
  if (!Array.isArray(currentLayout)) {
    console.error("Current layout is not an array:", currentLayout);
    return []; // Return empty array to avoid further errors
  }

  const position = getNextPosition(currentLayout, widget.type === WidgetTypes.BOOLEAN ? 6 : 6, cols);

  return [...currentLayout, {
    i: widget.id,
    x: position.x,
    y: position.y,
    w: widget.type === WidgetTypes.BOOLEAN ? 6 : 6,
    h: 4,
    isDraggable: true,
    isResizable: true
  }];
};
