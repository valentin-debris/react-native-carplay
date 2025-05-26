import * as React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { Template, TemplateConfig } from '../Template';
import { CarPlay } from '../../CarPlay';
import {
  PanGestureWithTranslationEvent,
  PinchGestureEvent,
  PressEvent,
} from 'src/interfaces/GestureEvent';
import { Action, AndroidAction } from 'src/interfaces/Action';

function getId() {
  return `${performance.now()}-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`;
}

export interface AndroidNavigationBaseTemplateConfig extends TemplateConfig {
    /**
   * Your component to render inside Android Auto Map view
   * NavigationTemplate is required to have this, other templates might skip this if a NavigationTemplate is in place already
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: React.ComponentType<any>;

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

  private pressableCallbacks: {
    [key: string]: () => void;
  } = {};

  constructor(public config: T) {
    const { component, ...rest } = config;

    super(config);

    this.config = this.parseConfig({ type: this.type, ...rest, render: true });

    if (component) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const template = this;

      AppRegistry.registerComponent(
        this.id,
        () => props => React.createElement(component, { ...props, template: template }),
      );
    }

    const subscription = CarPlay.emitter.addListener(
      'buttonPressed',
      ({ buttonId }: { templateId?: string; buttonId: string }) => {
        const callback = this.pressableCallbacks[buttonId];
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

    CarPlay.bridge.createTemplate(this.id, this.config, callbackFn);
  }

  public parseConfig(
    config: TemplateConfig & {
      actions?: Array<AndroidAction>;
      mapButtons?: Array<AndroidAction>;
      navigateAction?: AndroidAction;
    },
  ) {
    const { actions, mapButtons, navigateAction, ...rest } = config;

    const updatedConfig: TemplateConfig & {
      actions?: Array<Action>;
      mapButtons?: Array<Action>;
      navigateAction?: Action;
    } = { ...rest };

    const callbackIds = new Array<string>();

    if (actions != null) {
      updatedConfig.actions = actions.map(action => {
        const id = 'id' in action ? action.id : getId();
        if (id == null) {
          return action;
        }

        callbackIds.push(id);

        if (!('onPress' in action)) {
          return action;
        }
        const { onPress, ...rest } = action;
        this.pressableCallbacks[id] = onPress;
        return { ...rest, id };
      });
    }

    if (mapButtons) {
      updatedConfig.mapButtons = mapButtons.map(mapButton => {
        const id = 'id' in mapButton ? mapButton.id : getId();
        if (id == null) {
          return mapButton;
        }

        callbackIds.push(id);

        if (!('onPress' in mapButton)) {
          return mapButton;
        }
        const { onPress, ...rest } = mapButton;
        this.pressableCallbacks[id] = onPress;
        return { ...rest, id };
      });
    }

    if (navigateAction) {
      const id = 'id' in navigateAction ? navigateAction.id : getId();

      if (id != null) {
        callbackIds.push(id);

        if ('onPress' in navigateAction) {
          const { onPress, ...rest } = navigateAction;
          this.pressableCallbacks[id] = onPress;
          updatedConfig.navigateAction = { ...rest, id };
        }
      }
    }

    this.pressableCallbacks = Object.fromEntries(
      Object.entries(this.pressableCallbacks).filter(([id]) => callbackIds.includes(id)),
    );

    return super.parseConfig(updatedConfig);
  }
}
