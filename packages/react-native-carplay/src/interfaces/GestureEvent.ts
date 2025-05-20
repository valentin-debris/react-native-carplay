export interface PanGestureWithTranslationEvent {
  translation: { x: number; y: number };
  /**
   * only reported on iOS/CarPlay
   */
  velocity?: { x: number; y: number };
}

/**
 * @namespace Android
 */
export interface PinchGestureEvent {
  /**
   * screen coordinate of the pinch center
   */
  x: number;
  /**
   * screen coordinate of the pinch center
   */
  y: number;
  /**
   * scale factor
   * value > 0.0 and < 2.0 when 1.0 means no scaling, > 1.0 zoom in and < 1.0 zoom out
   * value == 2.0 is a double tap
   */
  scaleFactor: number;
}

/**
 * @namespace Android
 */
export interface PressEvent {
  /**
   * screen coordinate of the press event
   */
  x: number;
  /**
   * screen coordinate of the press event
   */
  y: number;
}
