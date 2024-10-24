import {
  AppRegistry,
  Image,
  type EmitterSubscription,
  type NativeEventEmitter,
} from 'react-native';
import type { DashboardConfig, DashboardShortcutButtonConfig } from 'src/interfaces/Dashboard';
import type { InternalCarPlay } from 'src/interfaces/InternalCarPlay';

type NativeDashboardShortcutButtonConfig = Array<
  Omit<DashboardShortcutButtonConfig, 'onPress'> & { index: number; launchCarplayScene: boolean }
>;

export class Dashboard {
  private readonly bridge: InternalCarPlay;
  private readonly emitter: NativeEventEmitter;

  private subscriptions: Array<EmitterSubscription> = [];
  private buttonSubscription: EmitterSubscription | null = null;

  constructor(bridge: InternalCarPlay, emitter: NativeEventEmitter) {
    this.bridge = bridge;
    this.emitter = emitter;
  }

  public create(config: DashboardConfig) {
    for (const subscription of [...this.subscriptions, this.buttonSubscription]) {
      subscription?.remove();
    }
    
    const { id, component, onConnect, onDisconnect, onSafeAreaInsetsChanged, shortcutButtons } =
      config;

    if (onConnect != null) {
      const subscription = this.emitter.addListener('dashboardDidConnect', e => onConnect(e));
      this.subscriptions.push(subscription);
    }

    if (onDisconnect != null) {
      const subscription = this.emitter.addListener('dashboardDidDisconnect', onDisconnect);
      this.subscriptions.push(subscription);
    }

    if (onSafeAreaInsetsChanged != null) {
      const subscription = this.emitter.addListener('dashboardSafeAreaInsetsChanged', e =>
        onSafeAreaInsetsChanged(e),
      );
      this.subscriptions.push(subscription);
    }

    const dashboardConfig: {
      shortcutButtons: NativeDashboardShortcutButtonConfig;
    } = {
      shortcutButtons: [],
    };

    if (shortcutButtons != null) {
      for (var index = 0; index < shortcutButtons.length; index++) {
        const { onPress, ...button } = shortcutButtons[index];

        dashboardConfig.shortcutButtons.push({
          ...button,
          index,
          image: Image.resolveAssetSource(button.image),
          launchCarplayScene: button.launchCarplayScene ?? false,
        });
      }

      this.buttonSubscription = this.emitter.addListener('dashboardButtonPressed', e => {
        shortcutButtons[e.index]?.onPress?.();
      });
    }

    AppRegistry.registerComponent(id, () => component);
    this.bridge.createDashboard(id, dashboardConfig);
  }

  public checkForConnection(): void {
    this.bridge.checkForDashboardConnection();
  }

  public updateShortcutButtons(shortcutButtons: Array<DashboardShortcutButtonConfig>) {
    const config: { shortcutButtons: NativeDashboardShortcutButtonConfig } = {
      shortcutButtons: [],
    };

    this.buttonSubscription?.remove();

    for (var index = 0; index < shortcutButtons.length; index++) {
      const { onPress, ...button } = shortcutButtons[index];

      config.shortcutButtons.push({
        ...button,
        index,
        image: Image.resolveAssetSource(button.image),
        launchCarplayScene: button.launchCarplayScene ?? false,
      });
    }

    this.buttonSubscription = this.emitter.addListener('dashboardButtonPressed', e => {
      shortcutButtons[e.index]?.onPress?.();
    });

    this.bridge.updateDashboardShortcutButtons(config);
  }
}
