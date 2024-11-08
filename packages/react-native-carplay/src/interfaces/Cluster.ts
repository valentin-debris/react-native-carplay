import type { ImageSourcePropType } from 'react-native';
import { WindowInformation } from './WindowInformation';

export interface ClusterConfig {
  /**
   * the id you got from the onClusterConnect callback using CarPlay.registerOnClusterConnect
   */
  id: string;
  component: React.ComponentType<any>;
  /**
   * inactiveDescriptionVariants is an array of a string and an optional image to be displayed when the user is not actively navigating arranged from most to least preferred.
   */
  inactiveDescriptionVariants: InactiveDescriptionVariant[];
  onDisconnect?: () => void;
  onSafeAreaInsetsChanged?: (e: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  }) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onDidChangeCompassSetting?: (setting: InstrumentClusterSetting) => void;
  onDidChangeSpeedLimitSetting?: (setting: InstrumentClusterSetting) => void;
  onWindowDidConnect?: (window: ClusterWindowInformation) => void;
  onContentStyleDidChange?: (contentStyle: ContentStyle) => void;
}

export type OnClusterControllerConnectCallback = ({
  id,
}: {
  id: string;
}) => void;

export interface InactiveDescriptionVariant {
  text: string;
  /**
   * attachment image size can be up to 64x25 points.
   */
  image?: ImageSourcePropType;
}

export enum InstrumentClusterSetting {
  Unspecified = 0,
  Enabled = 1,
  Disabled = 2,
  UserPreference = 3,
}

export enum ContentStyle {
  Unspecified = 0,
  Light = 1,
  Dark = 2,
}

export interface ClusterWindowInformation extends WindowInformation {
  contentStyle: ContentStyle;
}