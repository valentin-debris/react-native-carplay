import type { ImageSourcePropType } from 'react-native';
import type { WindowInformation } from './WindowInformation';

export interface DashboardShortcutButtonConfig {
  titleVariants: Array<string>;
  subtitleVariants: Array<string>;
  image: ImageSourcePropType;
  onPress: () => void;
  /**
   * set to true so your CarPlay scene will be launched when the button is pressed
   */
  launchCarplayScene?: boolean;
}

export interface DashboardConfig {
  id: string;
  component: React.ComponentType<any>;
  onConnect?: (window: WindowInformation) => void;
  onDisconnect?: () => void;
  onSafeAreaInsetsChanged?: (e: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  }) => void;
  /**
   * Buttons shown on the Dashboard when no navigation is active
   * up to 2 buttons can be placed in here according to Apple docs
   * https://developer.apple.com/documentation/carplay/cpdashboardcontroller/shortcutbuttons
   */
  shortcutButtons?: Array<DashboardShortcutButtonConfig>;
}
