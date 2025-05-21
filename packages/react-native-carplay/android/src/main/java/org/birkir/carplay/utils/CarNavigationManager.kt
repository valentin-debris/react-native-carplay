package org.birkir.carplay.utils

import androidx.car.app.CarContext
import androidx.car.app.navigation.NavigationManager
import androidx.car.app.navigation.NavigationManagerCallback

object CarNavigationManager {
    private lateinit var navigationManager: NavigationManager
    private lateinit var eventEmitter: EventEmitter

    fun init(carContext: CarContext, eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter

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
            }
        })
    }

    fun isInitialized(): Boolean =
        this::navigationManager.isInitialized && this::eventEmitter.isInitialized
}