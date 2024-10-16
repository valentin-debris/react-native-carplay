import { CarPlay } from '../CarPlay';
import { Maneuver } from '../interfaces/Maneuver';
import { PauseReason } from '../interfaces/PauseReason';
import { TravelEstimates } from '../interfaces/TravelEstimates';
import { MapTemplate } from '../templates/MapTemplate';
import { Trip } from './Trip';
import { Image, processColor } from 'react-native';

export class NavigationSession {
  public maneuvers: Maneuver[] = [];

  constructor(public id: string, public trip: Trip, public mapTemplate: MapTemplate) {}

  public updateManeuvers(maneuvers: Maneuver[]) {
    this.maneuvers = maneuvers;
    const windowScale = CarPlay.window?.scale || 1.0;
    CarPlay.bridge.updateManeuversNavigationSession(
      this.id,
      maneuvers.map(maneuver => {
        let symbolImage: Maneuver['symbolImage'];
        let symbolImageSize: Maneuver['symbolImageSize'];
        let junctionImage: Maneuver['junctionImage'];
        let tintSymbolImage: Maneuver['tintSymbolImage'];

        if (maneuver.symbolImage) {
          const image = Image.resolveAssetSource(maneuver.symbolImage);
          symbolImage = image;
          symbolImageSize = maneuver.symbolImageSize ?? { width: 50, height: 50 };
          const scale = image.scale || 1.0;
          const width = Math.floor((symbolImageSize.width * windowScale) / scale);
          const height = Math.floor((symbolImageSize.height * windowScale) / scale);
          symbolImageSize = { width, height };
        }
        if (maneuver.junctionImage) {
          junctionImage = Image.resolveAssetSource(maneuver.junctionImage);
        }
        if (maneuver.tintSymbolImage && typeof maneuver.tintSymbolImage === 'string') {
          tintSymbolImage = processColor(maneuver.tintSymbolImage);
        }
        return { ...maneuver, symbolImage, symbolImageSize, junctionImage, tintSymbolImage };
      }),
    );
  }

  public updateTravelEstimates(maneuverIndex: number, travelEstimates: TravelEstimates) {
    if (!travelEstimates.distanceUnits) {
      travelEstimates.distanceUnits = 'kilometers';
    }
    CarPlay.bridge.updateTravelEstimatesNavigationSession(this.id, maneuverIndex, travelEstimates);
  }

  public cancel() {
    CarPlay.bridge.cancelNavigationSession(this.id);
  }

  public finish() {
    CarPlay.bridge.finishNavigationSession(this.id);
  }

  public pause(reason: PauseReason, description?: string) {
    CarPlay.bridge.pauseNavigationSession(this.id, reason, description);
  }
}
