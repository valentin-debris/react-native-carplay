import type { ImageSourcePropType, NativeModule } from "react-native";
import type { Maneuver } from "./Maneuver";
import type { TravelEstimates } from "./TravelEstimates";
import type { PauseReason } from "./PauseReason";
import type { TripConfig } from "src/navigation/Trip";
import type { TimeRemainingColor } from "./TimeRemainingColor";
import type { TextConfiguration } from "./TextConfiguration";
import type { ImageSize } from "src/CarPlay";
import type { Action } from "./Action";

export interface InternalCarPlay extends NativeModule {
    checkForConnection(): void;
    setRootTemplate(templateId: string, animated: boolean): void;
    pushTemplate(templateId: string, animated: boolean): void;
    popToTemplate(templateId: string, animated: boolean): void;
    popToRootTemplate(animated: boolean): void;
    popTemplate(animated: boolean): void;
    presentTemplate(templateId: string, animated: boolean): void;
    dismissTemplate(animated: boolean): void;
    enableNowPlaying(enabled: boolean): void;
    updateManeuversNavigationSession(id: string, x: Maneuver[]): void;
    updateTravelEstimatesNavigationSession(
      id: string,
      index: number,
      estimates: TravelEstimates,
    ): void;
    cancelNavigationSession(id: string): void;
    finishNavigationSession(id: string): void;
    pauseNavigationSession(id: string, reason: PauseReason, description?: string): void;
    createTrip(id: string, config: TripConfig): void;
    updateInformationTemplateItems(id: string, config: unknown): void;
    updateInformationTemplateActions(id: string, config: unknown): void;
    createTemplate(id: string, config: unknown, callback?: unknown): void;
    updateTemplate(id: string, config: unknown): void;
    invalidate(id: string): void;
    startNavigationSession(
      id: string,
      tripId: string,
    ): Promise<{
      tripId: string;
      navigationSessionId: string;
    }>;
    updateTravelEstimatesForTrip(
      id: string,
      tripId: string,
      travelEstimates: TravelEstimates,
      timeRemainingColor: TimeRemainingColor,
    ): void;
    updateMapTemplateConfig(id: string, config: unknown): void;
    updateMapTemplateMapButtons(id: string, config: unknown): void;
    hideTripPreviews(id: string): void;
    showTripPreviews(id: string, previews: string[], config: TextConfiguration): void;
    showRouteChoicesPreviewForTrip(id: string, tripId: string, config: TextConfiguration): void;
    presentNavigationAlert(id: string, config: unknown, animated: boolean): void;
    dismissNavigationAlert(id: string, animated: boolean): void;
    showPanningInterface(id: string, animated: boolean): void;
    dismissPanningInterface(id: string, animated: boolean): void;
    getMaximumListSectionCount(id: string): Promise<number>;
    getMaximumListItemCount(id: string): Promise<number>;
    getMaximumListItemImageSize(id: string): Promise<ImageSize>;
    getMaximumNumberOfGridImages(id: string): Promise<number>;
    getMaximumListImageRowItemImageSize(id: string): Promise<ImageSize>;
    reactToSelectedResult(status: boolean): void;
    updateListTemplateSections(id: string, config: unknown): void;
    updateListTemplateItem(id: string, config: unknown): void;
    reactToUpdatedSearchText(id: string, items: unknown): void;
    updateTabBarTemplates(id: string, config: unknown): void;
    activateVoiceControlState(id: string, identifier: string): void;
    getRootTemplate(callback: (templateId: string) => void): void;
    getTopTemplate(callback: (templateId: string) => void): void;
    // Android
    reload(): void;
    toast(message: string, duration: number): void;
    alert(config: {
      id: number;
      title: string;
      duration: number;
      subtitle?: string;
      icon?: ImageSourcePropType;
      actions?: Action[];
    }): void;
    createDashboard(id: string, config: unknown): void;
    checkForDashboardConnection(): void;
    updateDashboardShortcutButtons(config: unknown): void;
  }
  