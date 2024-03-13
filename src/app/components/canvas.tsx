import { Stage, Layer, Text } from 'react-konva';

function Canvas() {
  return (
    <Stage width={800} height={500} containerProps={{ className: 'canvas' }}>
      <Layer>
        <Text
          draggable
          text="Hello, React Konva!"
          fontSize={30}
          fontFamily="Arial"
          fill="red"
          x={20}
          y={20}
        />
      </Layer>
    </Stage>
  );
}

export default Canvas;