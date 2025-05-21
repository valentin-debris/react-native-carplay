import { ImageResolvedAssetSource } from 'react-native';
import { NavigationStep } from './NavigationStep';

export type NavigationRoutingInfo = {
  type: 'routingInfo';
  loading?: boolean;
  junctionImage?: ImageResolvedAssetSource;
  nextStep?: NavigationStep;
  distance: number;
  distanceUnits: 'meters' | 'miles' | 'kilometers' | 'yards' | 'feet';
  step: NavigationStep;
};

export type NavigationMessageInfo = {
  type: 'messageInfo';
  title: string;
  image?: ImageResolvedAssetSource;
};

export type NavigationInfo = NavigationRoutingInfo | NavigationMessageInfo;
