import { AppRegistry, Platform } from 'react-native';
import { Template, TemplateConfig } from '../Template';
import { CarPlay } from '../../CarPlay';
import { PanGestureWithTranslationEvent, PinchGestureEvent, PressEvent } from 'src/interfaces/GestureEvent';

export interface AndroidNavigationBaseTemplateConfig extends TemplateConfig {
  /**
   * Your component to render inside Android Auto Map view
   * Example `component: MyComponent`
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;

  onDidShowPanningInterface?(): void;
  onDidDismissPanningInterface?(): void;

  /**
   * Fired when a button is pressed
   */
  onButtonPressed?(e: {buttonId: string}): void;

  /**
   * Fired when a pan gesture is happening
   * @param e coordinates for the pan event
   */
  onDidUpdatePanGestureWithTranslation?(e: PanGestureWithTranslationEvent): void;

  /**
   * Fired when a pinch gesture or a double tap happens
   * @param e PinchGestureEvent
   */
  onDidUpdatePinchGesture?(e: PinchGestureEvent): void;

  /**
   * Fired when a press event happens (single tap)
   * @param e PressEvent
   */
  onDidPress?(e: PressEvent): void;
}

export class AndroidNavigationBaseTemplate<
  T extends AndroidNavigationBaseTemplateConfig,
> extends Template<T> {
  get eventMap() {
    return {
      didShowPanningInterface: 'onDidShowPanningInterface',
      didDismissPanningInterface: 'onDidDismissPanningInterface',
      buttonPressed: 'onButtonPressed',
      didUpdatePanGestureWithTranslation: 'onDidUpdatePanGestureWithTranslation',
      didUpdatePinchGesture: 'onDidUpdatePinchGesture',
      didPress: 'onDidPress'
    };
  }

  constructor(public config: T) {
    super(config);

    if (config.component) {
      AppRegistry.registerComponent(this.id, () => config.component);
    }

    const callbackFn = Platform.select({
      android: ({ error }: { error?: string } = {}) => {
        error && console.error(error);
      },
    });

    CarPlay.bridge.createTemplate(
      this.id,
      this.parseConfig({ type: this.type, ...config, render: true }),
      callbackFn,
    );
  }
}
