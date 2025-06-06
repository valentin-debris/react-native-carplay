import { ImageResolvedAssetSource } from 'react-native';
import { NavigationStep } from './NavigationStep';
import { DistanceUnits } from './TravelEstimates';

export type NavigationRoutingInfo =
  | {
      type: 'routingInfo';
      loading?: false;
      junctionImage?: ImageResolvedAssetSource;
      nextStep?: NavigationStep;
      distance: number;
      distanceUnits: DistanceUnits;
      step: NavigationStep;
    }
  | { type: 'routingInfo'; loading: true };

export type NavigationMessageInfo = {
  type: 'messageInfo';
  title: string;
  image?: ImageResolvedAssetSource;
};

export type NavigationInfo = NavigationRoutingInfo | NavigationMessageInfo;
