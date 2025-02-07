import { AppRegistry, Image, type NativeEventEmitter } from 'react-native';
import { ClusterConfig } from 'src/interfaces/Cluster';
import type { InternalCarPlay } from 'src/interfaces/InternalCarPlay';

type Events =
  | 'onDisconnect'
  | 'onDidChangeCompassSetting'
  | 'onDidChangeSpeedLimitSetting'
  | 'onZoomIn'
  | 'onZoomOut'
  | 'onWindowDidConnect'
  | 'onContentStyleDidChange' | 'onStateChanged';

export class Cluster {
  private readonly bridge: InternalCarPlay;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subscriptions: { [key: string]: Partial<{ [key in Events]: (e?: any) => void }> } = {};
  private clusterIds = new Set<string>();

  /**
   * @returns ids of all connected clusters
   */
  public getClusterIds() {
    return [...this.clusterIds];
  }

  constructor(bridge: InternalCarPlay, emitter: NativeEventEmitter) {
    this.bridge = bridge;

    emitter.addListener('clusterDidDisconnect', (e: { id: string }) => {
      this.subscriptions[e.id]?.onDisconnect?.();
      this.clusterIds.delete(e.id);
    });

    emitter.addListener('clusterDidChangeCompassSetting', e => {
      const { id, compassSetting } = e;
      this.subscriptions[id]?.onDidChangeCompassSetting?.(compassSetting);
    });

    emitter.addListener('clusterDidChangeSpeedLimitSetting', e => {
      const { id, speedLimitSetting } = e;
      this.subscriptions[id]?.onDidChangeSpeedLimitSetting?.(speedLimitSetting);
    });

    emitter.addListener('clusterDidZoomIn', e => {
      this.subscriptions[e.id]?.onZoomIn?.();
    });

    emitter.addListener('clusterDidZoomOut', e => {
      this.subscriptions[e.id]?.onZoomOut?.();
    });

    emitter.addListener('clusterWindowDidConnect', e => {
      const { id, ...rest } = e;
      this.subscriptions[id]?.onWindowDidConnect?.(rest);
    });

    emitter.addListener('clusterContentStyleDidChange', e => {
      const { id, ...rest } = e;
      this.subscriptions[id]?.onContentStyleDidChange?.(rest);
    });

    emitter.addListener('clusterStateDidChange', e => {
      const { id, isVisible} = e;
      this.subscriptions[id]?.onStateChanged?.(isVisible);
    });
  }

  public create(config: ClusterConfig) {
    const {
      id,
      component,
      inactiveDescriptionVariants,
      onDisconnect,
      onDidChangeCompassSetting,
      onDidChangeSpeedLimitSetting,
      onZoomIn,
      onZoomOut,
      onWindowDidConnect,
      onContentStyleDidChange,
      onStateChanged,
    } = config;

    this.subscriptions[id] = {
      onDisconnect,
      onDidChangeCompassSetting,
      onDidChangeSpeedLimitSetting,
      onZoomIn,
      onZoomOut,
      onWindowDidConnect,
      onContentStyleDidChange,
      onStateChanged,
    };

    const clusterConfig = {
      inactiveDescriptionVariants: inactiveDescriptionVariants.map(description => ({
        ...description,
        image: description.image ? Image.resolveAssetSource(description.image) : null,
      })),
    };

    AppRegistry.registerComponent(id, () => component);
    this.clusterIds.add(id);
    this.bridge.initCluster(id, clusterConfig);
  }

  public checkForConnection(id: string): void {
    this.bridge.checkForClusterConnection(id);
  }
}
