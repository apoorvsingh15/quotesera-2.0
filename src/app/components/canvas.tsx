import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Transformer, Shape } from 'react-konva';
import { CanvasBackground } from './canvasBackground';

function Canvas() {
  const [text, setText] = useState('Resize me');
  const [isSelected, setIsSelected] = useState(false);

  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const handleSelect = () => {
    console.log('adsfdsef')
    setIsSelected(true);
  };

  const handleDeselect = () => {
    setIsSelected(false);
  };



  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <div>
      <div className='border max-w-[700px] mx-auto my-0'>
        <Stage width={700} height={500} containerProps={{ className: 'canvas' }}>
          <Layer>
            <CanvasBackground />
            <Text
              draggable
              text="Hello, React Konva!"
              fontSize={30}
              fontFamily="Roboto"
              fill="red"
              x={20}
              y={20}
            />
            <Text
              draggable
              ref={shapeRef}
              text={text}
              fontSize={20}
              fontFamily="Roboto"
              fill="green"
              x={20}
              y={20}
            />

          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default Canvas;