import * as React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { Template, TemplateConfig } from '../Template';
import { CarPlay } from '../../CarPlay';
import {
  PanGestureWithTranslationEvent,
  PinchGestureEvent,
  PressEvent,
} from 'src/interfaces/GestureEvent';
import { Action, CallbackAction } from 'src/interfaces/Action';

function hasArrayProperty<K extends string, V>(
  config: AndroidNavigationBaseTemplateConfig,
  key: K,
): config is AndroidNavigationBaseTemplateConfig & { [P in K]: Array<CallbackAction> } {
  const prop = (config as Partial<Record<K, V[]>>)[key];
  if (!Array.isArray(prop)) {
    return false;
  }
  return prop.every(isCallbackAction);
}

function hasCallbackActionProperty<K extends string>(
  config: AndroidNavigationBaseTemplateConfig,
  key: K,
): config is AndroidNavigationBaseTemplateConfig & { [P in K]: CallbackAction } {
  const prop = (config as Partial<Record<K, unknown>>)[key];
  return isCallbackAction(prop);
}

function isCallbackAction(value: unknown): value is CallbackAction {
  return typeof value === 'object' && value !== null && 'onPress' in value;
}

function getId() {
  return `${performance.now()}-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`;
}

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
      didUpdatePanGestureWithTranslation: 'onDidUpdatePanGestureWithTranslation',
      didUpdatePinchGesture: 'onDidUpdatePinchGesture',
      didPress: 'onDidPress',
      didCancelNavigation: 'onDidCancelNavigation',
      didEnableAutoDrive: 'onAutoDriveEnabled',
    };
  }

  constructor(public config: T) {
    const pressableCallbacks: { [key: string]: () => void } = {};

    const updatedConfig: T & {
      actions?: Array<Action>;
      mapButtons?: Array<Action>;
      navigateAction?: Action;
    } = { ...config };

    if (hasArrayProperty(config, 'actions')) {
      updatedConfig.actions = config.actions.map(action => {
        const id = getId();
        const { onPress, ...rest } = action;
        pressableCallbacks[id] = onPress;
        return { ...rest, id };
      });
    }

    if (hasArrayProperty(config, 'mapButtons')) {
      updatedConfig.mapButtons = config.mapButtons.map(mapButton => {
        const id = getId();
        const { onPress, ...rest } = mapButton;
        pressableCallbacks[id] = onPress;
        return { ...rest, id };
      });
    }

    if (hasCallbackActionProperty(config, 'navigateAction')) {
      const id = getId();
      const { onPress, ...rest } = config.navigateAction;
      pressableCallbacks[id] = onPress;
      updatedConfig.navigateAction = { ...rest, id };
    }

    config = updatedConfig;

    super(config);

    if (config.component) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const template = this;

      AppRegistry.registerComponent(
        this.id,
        () => props => React.createElement(config.component, { ...props, template: template }),
      );
    }

    const subscription = CarPlay.emitter.addListener(
      'buttonPressed',
      ({ buttonId }: { templateId?: string; buttonId: string }) => {
        const callback = pressableCallbacks[buttonId];
        if (callback == null || typeof callback !== 'function') {
          return;
        }
        callback();
      },
    );

    this.listenerSubscriptions.push(subscription);

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
