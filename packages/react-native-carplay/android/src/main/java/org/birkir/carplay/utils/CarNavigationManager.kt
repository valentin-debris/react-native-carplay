package org.birkir.carplay.utils

import android.util.Log
import androidx.car.app.CarContext
import androidx.car.app.navigation.NavigationManager
import androidx.car.app.navigation.NavigationManagerCallback
import androidx.car.app.navigation.model.TravelEstimate
import androidx.car.app.navigation.model.Trip
import com.facebook.react.bridge.ReadableMap
import org.birkir.carplay.parser.Parser

object CarNavigationManager {
    private val TAG = "CarNavigationManager"

    private lateinit var navigationManager: NavigationManager
    private lateinit var eventEmitter: EventEmitter
    private lateinit var carContext: CarContext

    private var isNavigating = false

    fun init(carContext: CarContext, eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter
        this.carContext = carContext

        if (this::navigationManager.isInitialized) {
            return
        }

        navigationManager = carContext.getCarService(NavigationManager::class.java)

        navigationManager.setNavigationManagerCallback(object : NavigationManagerCallback {
            override fun onAutoDriveEnabled() {
                eventEmitter.didEnableAutoDrive()
            }

            override fun onStopNavigation() {
                eventEmitter.didCancelNavigation()
                isNavigating = false
            }
        })
    }

    fun isInitialized(): Boolean =
        this::navigationManager.isInitialized && this::eventEmitter.isInitialized

    fun navigationStarted() {
        navigationManager.navigationStarted()
        isNavigating = true
    }

    fun navigationEnded() {
        navigationManager.navigationEnded()
        isNavigating = false
    }

    fun updateTrip(tripConfig: ReadableMap) {
        if (!isNavigating) {
            return
        }

        val trip = Trip.Builder().apply {
            tripConfig.getArray("steps")?.let { steps ->
                for (i in 0 until(steps.size())) {
                    val stepConfig = steps.getMap(i)
                    val step = Parser.parseStep(stepConfig, carContext)
                    val stepTravelEstimate =  Parser.parseTravelEstimate(stepConfig.getMap("stepTravelEstimate")!!)
                    addStep(step, stepTravelEstimate)
                }
            }
            tripConfig.getArray("destinations")?.let { destinations ->
                for (i in 0 until(destinations.size())) {
                    val destinationConfig = destinations.getMap(i)
                    val destination = Parser.parseDestination(destinationConfig, carContext)
                    val destinationTravelEstimate = Parser.parseTravelEstimate(destinationConfig.getMap("destinationTravelEstimate")!!)
                    addDestination(destination, destinationTravelEstimate)
                }
            }
        }.build()

        navigationManager.updateTrip(trip)
    }
}