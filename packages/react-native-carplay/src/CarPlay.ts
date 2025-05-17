import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { ActionSheetTemplate } from './templates/ActionSheetTemplate';
import { AlertTemplate } from './templates/AlertTemplate';
import { ContactTemplate } from './templates/ContactTemplate';
import { GridTemplate } from './templates/GridTemplate';
import { InformationTemplate } from './templates/InformationTemplate';
import { ListTemplate } from './templates/ListTemplate';
import { MapTemplate } from './templates/MapTemplate';
import { NowPlayingTemplate } from './templates/NowPlayingTemplate';
import { PointOfInterestTemplate } from './templates/PointOfInterestTemplate';
import { SearchTemplate } from './templates/SearchTemplate';
import { TabBarTemplate } from './templates/TabBarTemplate';
import { VoiceControlTemplate } from './templates/VoiceControlTemplate';
import { MessageTemplate } from './templates/android/MessageTemplate';
import { NavigationTemplate } from './templates/android/NavigationTemplate';
import { PaneTemplate } from './templates/android/PaneTemplate';
import { PlaceListMapTemplate } from './templates/android/PlaceListMapTemplate';
import { PlaceListNavigationTemplate } from './templates/android/PlaceListNavigationTemplate';
import { RoutePreviewNavigationTemplate } from './templates/android/RoutePreviewNavigationTemplate';
import { Dashboard } from './scenes/Dashboard';
import { InternalCarPlay } from './interfaces/InternalCarPlay';
import { WindowInformation } from './interfaces/WindowInformation';
import { OnClusterControllerConnectCallback } from './interfaces/Cluster';
import { Cluster } from './scenes/Cluster';
import registerHeadlessTask from './CarPlayHeadlessJsTask';

const { RNCarPlay } = NativeModules as { RNCarPlay: InternalCarPlay };

export type PushableTemplates =
  | MapTemplate
  | SearchTemplate
  | GridTemplate
  | PointOfInterestTemplate
  | ListTemplate
  | MessageTemplate
  | PaneTemplate
  | InformationTemplate
  | ContactTemplate
  | NowPlayingTemplate
  | NavigationTemplate
  | PlaceListMapTemplate
  | PlaceListNavigationTemplate
  | RoutePreviewNavigationTemplate;

export type PresentableTemplates = AlertTemplate | ActionSheetTemplate | VoiceControlTemplate;

export type ImageSize = {
  width: number;
  height: number;
};

export type OnConnectCallback = (window: WindowInformation) => void;
export type OnDisconnectCallback = () => void;

type AppearanceInformation = {
  colorScheme: 'dark' | 'light';
  /**
   * id that was specified on the MapTemplate, Dashboard or Cluster
   */
  id: string;
};

export type OnAppearanceDidChangeCallback = ({ colorScheme, id }: AppearanceInformation) => void;

export interface SafeAreaInsetsEvent {
  bottom: number;
  left: number;
  right: number;
  top: number;
  /**
   * id that was specified on the MapTemplate, Dashboard or Cluster
   */
  id: string;
}

export type OnSafeAreaInsetsDidChangeCallback = (safeAreaInsets: SafeAreaInsetsEvent) => void;
/**
 * A controller that manages all user interface elements appearing on your map displayed on the CarPlay screen.
 */
export class CarPlayInterface {
  /**
   * React Native bridge to the CarPlay interface
   */
  public bridge = RNCarPlay;

  /**
   * Boolean to denote if carplay is currently connected.
   */
  public connected = false;
  public window: WindowInformation | undefined;

  /**
   * CarPlay Event Emitter
   */
  public emitter = new NativeEventEmitter(RNCarPlay);

  private onConnectCallbacks = new Set<OnConnectCallback>();
  private onDisconnectCallbacks = new Set<OnDisconnectCallback>();
  private onClusterConnectCallbacks = new Set<OnClusterControllerConnectCallback>();
  private onAppearanceDidChangeCallbacks = new Set<OnAppearanceDidChangeCallback>();
  private onOnSafeAreaInsetsDidChangeCallbacks = new Set<OnSafeAreaInsetsDidChangeCallback>();

  constructor() {
    registerHeadlessTask();

    this.emitter.addListener('didConnect', (window: WindowInformation) => {
      console.log('we are connected yes!');
      this.connected = true;
      this.window = window;
      this.onConnectCallbacks.forEach(callback => {
        callback(window);
      });
    });
    this.emitter.addListener('didDisconnect', () => {
      this.connected = false;
      this.window = undefined;
      this.onDisconnectCallbacks.forEach(callback => {
        callback();
      });
    });
    if (Platform.OS === 'android') {
      this.emitter.addListener('didPressMenuItem', e => {
        if (e?.title === 'Reload Android Auto') {
          this.bridge.reload();
        }
      });
    }

    this.emitter.addListener('clusterControllerDidConnect', (props: { id: string }) => {
      this.onClusterConnectCallbacks.forEach(callback => callback(props));
    });

    this.emitter.addListener('appearanceDidChange', (props: AppearanceInformation) => {
      this.onAppearanceDidChangeCallbacks.forEach(callback => callback(props));
    });

    this.emitter.addListener('safeAreaInsetsDidChange', (props: SafeAreaInsetsEvent) => {
      this.onOnSafeAreaInsetsDidChangeCallbacks.forEach(callback => callback(props));
    });

    // check if already connected this will fire any 'didConnect' events
    // if a connected is already present.
    if (Platform.OS === 'ios') {
      this.bridge.checkForConnection();
    }
  }

  /**
   * Fired when CarPlay is connected to the device.
   */
  public registerOnConnect = (callback: OnConnectCallback) => {
    this.onConnectCallbacks.add(callback);
  };

  public unregisterOnConnect = (callback: OnConnectCallback) => {
    this.onConnectCallbacks.delete(callback);
  };

  /**
   * Fired when CarPlay is disconnected from the device.
   */
  public registerOnDisconnect = (callback: OnDisconnectCallback) => {
    this.onDisconnectCallbacks.add(callback);
  };

  public unregisterOnDisconnect = (callback: OnDisconnectCallback) => {
    this.onDisconnectCallbacks.delete(callback);
  };

  public registerOnClusterConnect = (callback: OnClusterControllerConnectCallback) => {
    this.onClusterConnectCallbacks.add(callback);
    return {
      remove: () => {
        this.onClusterConnectCallbacks.delete(callback);
      },
    };
  };

  public registerOnAppearanceDidChange = (callback: OnAppearanceDidChangeCallback) => {
    this.onAppearanceDidChangeCallbacks.add(callback);
    return {
      remove: () => {
        this.onAppearanceDidChangeCallbacks.delete(callback);
      },
    };
  };

  public registerOnSafeAreaInsetsDidChange = (callback: OnSafeAreaInsetsDidChangeCallback) => {
    this.onOnSafeAreaInsetsDidChangeCallbacks.add(callback);
    return {
      remove: () => {
        this.onOnSafeAreaInsetsDidChangeCallbacks.delete(callback);
      },
    };
  };

  /**
   * Sets the root template, starting a new stack for the template navigation hierarchy.
   * @param rootTemplate The root template. Replaces the current rootTemplate, if one exists.
   * @param animated Set TRUE to animate the presentation of the root template; ignored if there isn't a current rootTemplate.
   */
  public setRootTemplate(rootTemplate: PushableTemplates | TabBarTemplate, animated = true) {
    return this.bridge.setRootTemplate(rootTemplate.id, animated);
  }

  /**
   * Pushes a template onto the navigation stack and updates the display.
   * @param templateToPush The template to push onto the navigation stack.
   * @param animated Set TRUE to animate the presentation of the template.
   */
  public pushTemplate(templateToPush: PushableTemplates, animated = true) {
    return this.bridge.pushTemplate(templateToPush.id, animated);
  }

  /**
   * Pops templates until the specified template is at the top of the navigation stack.
   * @param targetTemplate The template that you want at the top of the stack. The template must be on the navigation stack before calling this method.
   * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public popToTemplate(targetTemplate: PushableTemplates, animated = true) {
    return this.bridge.popToTemplate(targetTemplate.id, animated);
  }

  /**
   * Pops all templates on the stack—except the root template—and updates the display.
   * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public popToRootTemplate(animated = true) {
    return this.bridge.popToRootTemplate(animated);
  }

  /**
   * Pops the top template from the navigation stack and updates the display.
   * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public popTemplate(animated = true) {
    return this.bridge.popTemplate(animated);
  }

  /**
   * presents a presentable template, alert / action / voice
   * @param templateToPresent The presentable template to present
   * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public presentTemplate(templateToPresent: PresentableTemplates, animated = true) {
    return this.bridge.presentTemplate(templateToPresent.id, animated);
  }

  /**
   * Dismisses the current presented template
   * * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public dismissTemplate(animated = true) {
    return this.bridge.dismissTemplate(animated);
  }

  /**
   * The current root template in the template navigation hierarchy.
   */
  public get rootTemplate(): Promise<string> {
    return new Promise(resolve => {
      this.bridge.getRootTemplate(templateId => {
        resolve(templateId);
      });
    });
  }

  /**
   * The top-most template in the navigation hierarchy stack.
   */
  public get topTemplate(): Promise<string> {
    return new Promise(resolve => {
      this.bridge.getTopTemplate(templateId => {
        resolve(templateId);
      });
    });
  }

  /**
   * Control now playing template state
   * @param enable A Boolean value that indicates whether the system use now playing template.
   */
  public enableNowPlaying(enable = true) {
    return this.bridge.enableNowPlaying(enable);
  }
}

export const CarPlay = new CarPlayInterface();
export const CarPlayDashboard = new Dashboard(CarPlay.bridge, CarPlay.emitter);
export const CarPlayCluster = new Cluster(CarPlay.bridge, CarPlay.emitter);
