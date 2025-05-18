export interface PanGestureWithTranslationEvent {
  translation: { x: number; y: number };
  /**
   * only reported on iOS/CarPlay
   */
  velocity?: { x: number; y: number };
}
