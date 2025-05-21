import { ImageResolvedAssetSource } from 'react-native';

export type NavigationStep = {
  lane: {
    shape: number;
    recommended: boolean;
  };
  cue?: string;
  lanesImage: ImageResolvedAssetSource;
  maneuver?: Maneuver;
  road?: string;
};

type BaseManeuver = {
  type: Exclude<
    AndroidAutoManeuverType,
    | AndroidAutoManeuverType.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW
    | AndroidAutoManeuverType.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW
    | AndroidAutoManeuverType.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE
    | AndroidAutoManeuverType.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE
  >;
  image: ImageResolvedAssetSource;
};

type RoundaboutManeuver = {
  type:
    | AndroidAutoManeuverType.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW
    | AndroidAutoManeuverType.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW;
  roundaboutExitNumber: number;
  image: ImageResolvedAssetSource;
};

type RoundaboutWithAngleManeuver = {
  type:
    | AndroidAutoManeuverType.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE
    | AndroidAutoManeuverType.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE;
  roundaboutExitNumber: number;
  roundaboutExitAngle: number;
  image: ImageResolvedAssetSource;
};

type Maneuver = BaseManeuver | RoundaboutManeuver | RoundaboutWithAngleManeuver;

export enum AndroidAutoManeuverType {
  TYPE_UNKNOWN = 0,
  TYPE_DEPART = 1,
  TYPE_NAME_CHANGE = 2,
  TYPE_KEEP_LEFT = 3,
  TYPE_KEEP_RIGHT = 4,
  TYPE_TURN_SLIGHT_LEFT = 5,
  TYPE_TURN_SLIGHT_RIGHT = 6,
  TYPE_TURN_NORMAL_LEFT = 7,
  TYPE_TURN_NORMAL_RIGHT = 8,
  TYPE_TURN_SHARP_LEFT = 9,
  TYPE_TURN_SHARP_RIGHT = 10,
  TYPE_U_TURN_LEFT = 11,
  TYPE_U_TURN_RIGHT = 12,
  TYPE_ON_RAMP_SLIGHT_LEFT = 13,
  TYPE_ON_RAMP_SLIGHT_RIGHT = 14,
  TYPE_ON_RAMP_NORMAL_LEFT = 15,
  TYPE_ON_RAMP_NORMAL_RIGHT = 16,
  TYPE_ON_RAMP_SHARP_LEFT = 17,
  TYPE_ON_RAMP_SHARP_RIGHT = 18,
  TYPE_ON_RAMP_U_TURN_LEFT = 19,
  TYPE_ON_RAMP_U_TURN_RIGHT = 20,
  TYPE_OFF_RAMP_SLIGHT_LEFT = 21,
  TYPE_OFF_RAMP_SLIGHT_RIGHT = 22,
  TYPE_OFF_RAMP_NORMAL_LEFT = 23,
  TYPE_OFF_RAMP_NORMAL_RIGHT = 24,
  TYPE_FORK_LEFT = 25,
  TYPE_FORK_RIGHT = 26,
  TYPE_MERGE_LEFT = 27,
  TYPE_MERGE_RIGHT = 28,
  TYPE_MERGE_SIDE_UNSPECIFIED = 29,
  TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW = 32,
  TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE = 33,
  TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW = 34,
  TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE = 35,
  TYPE_STRAIGHT = 36,
  TYPE_FERRY_BOAT = 37,
  TYPE_FERRY_TRAIN = 38,
  TYPE_DESTINATION = 39,
  TYPE_DESTINATION_STRAIGHT = 40,
  TYPE_DESTINATION_LEFT = 41,
  TYPE_DESTINATION_RIGHT = 42,
  TYPE_ROUNDABOUT_ENTER_CW = 43,
  TYPE_ROUNDABOUT_EXIT_CW = 44,
  TYPE_ROUNDABOUT_ENTER_CCW = 45,
  TYPE_ROUNDABOUT_EXIT_CCW = 46,
  TYPE_FERRY_BOAT_LEFT = 47,
  TYPE_FERRY_BOAT_RIGHT = 48,
  TYPE_FERRY_TRAIN_LEFT = 49,
  TYPE_FERRY_TRAIN_RIGHT = 50,
}
