package org.birkir.carplay

import android.util.Log
import androidx.car.app.CarContext
import androidx.car.app.hardware.CarHardwareManager
import androidx.car.app.hardware.common.CarValue
import androidx.car.app.hardware.common.OnCarDataAvailableListener
import androidx.car.app.hardware.info.EnergyLevel
import androidx.car.app.hardware.info.Mileage
import androidx.car.app.hardware.info.Model
import androidx.car.app.hardware.info.Speed
import androidx.car.app.versioning.CarAppApiLevels
import androidx.core.content.ContextCompat

import com.facebook.react.bridge.Arguments
import org.birkir.carplay.utils.EventEmitter

class CarPlayTelemetryObserver(private val mCarContext: CarContext, private val eventEmitter: EventEmitter) {
    private var isRunning = false;

    private val mModelListener = OnCarDataAvailableListener<Model> {
        synchronized(
            this
        ) {
            var vehicle = Arguments.createMap()
            if (it.name.status == CarValue.STATUS_SUCCESS) {
                vehicle.putMap("name", Arguments.createMap().apply {
                    putString("value", it.name.value)
                    putLong("timestamp", it.name.timestampMillis)
                })
            }
            if (it.manufacturer.status == CarValue.STATUS_SUCCESS) {
                vehicle.putMap("manufacturer", Arguments.createMap().apply {
                    putString("value", it.manufacturer.value)
                    putLong("timestamp", it.manufacturer.timestampMillis)
                })
            }
            if (it.year.status == CarValue.STATUS_SUCCESS) {
                vehicle.putMap("year", Arguments.createMap().apply {
                    putInt("value", it.year.value)
                    putLong("timestamp", it.year.timestampMillis)
                })
            }
            eventEmitter.telemetry(Arguments.createMap().apply {
                putMap("vehicle", vehicle)
            })
        }
    }

    private val mEnergyLevelListener = OnCarDataAvailableListener<EnergyLevel> { carEnergyLevel ->
        synchronized(
            this
        ) {
            // REVISIT: throttle this to avoid flooding the event bus?
            val timestamp = System.currentTimeMillis() / 1000.0
            var telemetry = Arguments.createMap()

            if (carEnergyLevel.batteryPercent.status == CarValue.STATUS_SUCCESS) {
                carEnergyLevel.batteryPercent.value?.let {
                    telemetry.putMap("batteryLevel", Arguments.createMap().apply {
                        putDouble("value", it.toDouble())
                        putDouble("timestamp", timestamp)
                    })
                } ?: run {
                    telemetry.putMap("batteryLevel", Arguments.createMap().apply {
                        putNull("value")
                        putDouble("timestamp", timestamp)
                    })
                }
            }
            if (carEnergyLevel.fuelPercent.status == CarValue.STATUS_SUCCESS) {
                // just in case some manufacturers map this wrongly
                carEnergyLevel.fuelPercent.value?.let {
                    telemetry.putMap("fuelLevel", Arguments.createMap().apply {
                        putDouble("value", it.toDouble())
                        putDouble("timestamp", timestamp)
                    })
                } ?: run {
                    telemetry.putMap("fuelLevel", Arguments.createMap().apply {
                        putNull("value")
                        putDouble("timestamp", timestamp)
                    })
                }
            }
            if (carEnergyLevel.rangeRemainingMeters.status == CarValue.STATUS_SUCCESS) {
                carEnergyLevel.rangeRemainingMeters.value?.let {
                    telemetry.putMap("range", Arguments.createMap().apply {
                        putDouble("value", it.div(1000.0))
                        putDouble("timestamp", timestamp)
                    })
                } ?: run {
                    telemetry.putMap("range", Arguments.createMap().apply {
                        putNull("value")
                        putDouble("timestamp", timestamp)
                    })
                }
            }

            eventEmitter.telemetry(telemetry)
        }
    }

    private val mSpeedListener = OnCarDataAvailableListener<Speed> { carSpeed ->
        synchronized(
            this
        ) {
            // REVISIT: throttle this to avoid flooding the event bus?
            var telemetry = Arguments.createMap()
            if (carSpeed.displaySpeedMetersPerSecond.status == CarValue.STATUS_SUCCESS) {
                val timestamp = System.currentTimeMillis() / 1000.0
                carSpeed.displaySpeedMetersPerSecond.value?.let {
                    // convert to km/h
                    telemetry.putMap("odometer", Arguments.createMap().apply {
                        putDouble("value", it.times(3.6))
                        putDouble("timestamp", timestamp)
                    })
                } ?: run {
                    telemetry.putMap("speed", Arguments.createMap().apply {
                        putNull("value")
                        putDouble("timestamp", timestamp)
                    })
                }
            }

            eventEmitter.telemetry(telemetry)
        }
    }

    private val mMileageListener = OnCarDataAvailableListener<Mileage> { carMileage ->
        synchronized(
            this
        ) {
            var telemetry = Arguments.createMap()

            if (carMileage.odometerMeters.status == CarValue.STATUS_SUCCESS) {
                val timestamp = System.currentTimeMillis() / 1000.0
                carMileage.odometerMeters.value?.let {
                    telemetry.putMap("odometer", Arguments.createMap().apply {
                        putDouble("value", it.div(1000.0))
                        putDouble("timestamp", timestamp)
                    })
                } ?: run {
                    telemetry.putMap("odometer", Arguments.createMap().apply {
                        putNull("value")
                        putDouble("timestamp", timestamp)
                    })
                }
            }

            eventEmitter.telemetry(telemetry)
        }
    }


    fun startTelemetryObserver() {
        if (mCarContext.carAppApiLevel < CarAppApiLevels.LEVEL_3) {
            Log.d("CarPlayTelemetryObserver", "Telemetry not supported for this API level")
            return
        }

        val carHardwareExecutor = ContextCompat.getMainExecutor(mCarContext)

        val carHardwareManager = mCarContext.getCarService(
            CarHardwareManager::class.java
        )
        val carInfo = carHardwareManager.carInfo

        // Request any single shot values.
        try {
            carInfo.fetchModel(carHardwareExecutor, mModelListener)
        } catch (_: SecurityException) {
        }

        if (isRunning) {
            // we stop here to not re-register multiple listeners, only the single shot values can be requested multiple times by registering another tlm listener on RN side
            Log.d("CarPlayTelemetryObserver", "Telemetry observer is already running")
            return
        }

        try {
            carInfo.addEnergyLevelListener(carHardwareExecutor, mEnergyLevelListener)
        } catch (_: SecurityException) {
        }

        try {
            carInfo.addSpeedListener(carHardwareExecutor, mSpeedListener)
        } catch (_: SecurityException) {
        }

        try {
            carInfo.addMileageListener(carHardwareExecutor, mMileageListener)
        } catch (_: SecurityException) {
        }
        isRunning = true;
    }

    fun stopTelemetryObserver() {
       val carHardwareManager = mCarContext.getCarService(
            CarHardwareManager::class.java
        )
        val carInfo = carHardwareManager.carInfo

        try {
            carInfo.removeEnergyLevelListener(mEnergyLevelListener)
        } catch (_: SecurityException) {
        }

        try {
            carInfo.removeSpeedListener(mSpeedListener)
        } catch (_: SecurityException) {
        }

        try {
            carInfo.removeMileageListener(mMileageListener)
        } catch (_: SecurityException) {
        }

        isRunning = false;
    }
}