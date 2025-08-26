import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number; // délai en millisecondes (par défaut 500ms)
}

export const useLongPress = ({ 
  onLongPress, 
  onClick, 
  delay = 500 
}: UseLongPressOptions) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // Prevent context menu on long press
    event.preventDefault();
    
    target.current = event.target;
    setLongPressTriggered(false);
    
    timeout.current = setTimeout(() => {
      onLongPress();
      setLongPressTriggered(true);
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback((event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
    timeout.current && clearTimeout(timeout.current);
    
    if (shouldTriggerClick && !longPressTriggered && onClick) {
      onClick();
    }
    
    setLongPressTriggered(false);
  }, [onClick, longPressTriggered]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: (event: React.MouseEvent) => clear(event),
    onMouseLeave: (event: React.MouseEvent) => clear(event, false),
    onTouchEnd: (event: React.TouchEvent) => clear(event),
  };
};
