// Android Auto Telemetry Permissions
export const CarFuelPermission = 'com.google.android.gms.permission.CAR_FUEL';
export const CarSpeedPermission = 'com.google.android.gms.permission.CAR_SPEED';
export const CarMileagePermission = 'com.google.android.gms.permission.CAR_MILEAGE';

export type TelemetryPermission =
  | typeof CarFuelPermission
  | typeof CarSpeedPermission
  | typeof CarMileagePermission;

type BaseTelemetryItem = {
  /**
   * timestamp in seconds when the value was received on native side
   */
  timestamp: number;
};
type NumericTelemetryItem = BaseTelemetryItem & {
  value: number;
};

type StringTelemetryItem = BaseTelemetryItem & {
  value: number;
};

export type Telemetry = {
  speed?: NumericTelemetryItem;
  fuelLevel?: NumericTelemetryItem;
  batteryLevel?: NumericTelemetryItem;
  range?: NumericTelemetryItem;
  odometer?: NumericTelemetryItem;
  vehicle?: {
    name?: StringTelemetryItem;
    year?: NumericTelemetryItem;
    manufacturer?: StringTelemetryItem;
  };
};

export type OnTelemetryCallback = (telemetry: Telemetry) => void;
