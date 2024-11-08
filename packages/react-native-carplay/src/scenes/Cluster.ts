import { AppRegistry, Image, type NativeEventEmitter } from 'react-native';
import { ClusterConfig } from 'src/interfaces/Cluster';
import type { InternalCarPlay } from 'src/interfaces/InternalCarPlay';

type Events =
  | 'onDisconnect'
  | 'onSafeAreaInsetsChanged'
  | 'onDidChangeCompassSetting'
  | 'onDidChangeSpeedLimitSetting'
  | 'onZoomIn'
  | 'onZoomOut';

export class Cluster {
  private readonly bridge: InternalCarPlay;

  private subscriptions: { [key: string]: Partial<{ [key in Events]: (e?: any) => void }> } = {};

  constructor(bridge: InternalCarPlay, emitter: NativeEventEmitter) {
    this.bridge = bridge;

    emitter.addListener('clusterDidDisconnect', e => {
      this.subscriptions[e.id]?.['onDisconnect']?.();
    });

    emitter.addListener('clusterSafeAreaInsetsChanged', e => {
      const { templateId, ...rest } = e;
      this.subscriptions[templateId]?.['onSafeAreaInsetsChanged']?.(rest);
    });

    emitter.addListener('clusterDidChangeCompassSetting', e => {
      const { id, ...rest } = e;
      this.subscriptions[id]?.['onDidChangeCompassSetting']?.(rest);
    });

    emitter.addListener('clusterDidChangeSpeedLimitSetting', e => {
      const { id, ...rest } = e;
      this.subscriptions[id]?.['onDidChangeSpeedLimitSetting']?.(rest);
    });

    emitter.addListener('clusterDidZoomIn', e => {
      this.subscriptions[e.id]?.['onZoomIn']?.();
    });

    emitter.addListener('clusterDidZoomOut', e => {
      this.subscriptions[e.id]?.['onZoomOut']?.();
    });
  }

  public create(config: ClusterConfig) {
    const {
      id,
      component,
      inactiveDescriptionVariants,
      onDisconnect,
      onSafeAreaInsetsChanged,
      onDidChangeCompassSetting,
      onDidChangeSpeedLimitSetting,
      onZoomIn,
      onZoomOut,
    } = config;

    this.subscriptions[id] = {
      onDisconnect,
      onSafeAreaInsetsChanged,
      onDidChangeCompassSetting,
      onDidChangeSpeedLimitSetting,
      onZoomIn,
      onZoomOut,
    };

    const clusterConfig = {
      inactiveDescriptionVariants: inactiveDescriptionVariants.map(description => ({
        ...description,
        image: description.image ? Image.resolveAssetSource(description.image) : null,
      })),
    };

    AppRegistry.registerComponent(id, () => component);
    this.bridge.initCluster(id, clusterConfig);
  }

  public checkForConnection(id: string): void {
    this.bridge.checkForClusterConnection(id);
  }
}
