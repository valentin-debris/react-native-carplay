import { ImageResolvedAssetSource } from 'react-native';
import { NavigationStep } from './NavigationStep';
import { DistanceUnits } from './TravelEstimates';

export type NavigationRoutingInfo = {
  type: 'routingInfo';
  loading?: boolean;
  junctionImage?: ImageResolvedAssetSource;
  nextStep?: NavigationStep;
  distance: number;
  distanceUnits: DistanceUnits;
  step: NavigationStep;
};

export type NavigationMessageInfo = {
  type: 'messageInfo';
  title: string;
  image?: ImageResolvedAssetSource;
};

export type NavigationInfo = NavigationRoutingInfo | NavigationMessageInfo;
