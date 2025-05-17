package org.birkir.carplay

import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import android.util.Log
import androidx.car.app.CarAppService
import androidx.car.app.Session
import androidx.car.app.SessionInfo
import androidx.car.app.validation.HostValidator
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import org.birkir.carplay.utils.EventEmitter

class CarPlayService : CarAppService() {
  private lateinit var reactInstanceManager: ReactInstanceManager
  private lateinit var emitter: EventEmitter
  private var mServiceBound = false

  private val connection: ServiceConnection = object : ServiceConnection {
    override fun onServiceConnected(
      className: ComponentName,
      service: IBinder
    ) {
      mServiceBound = true
    }

    override fun onServiceDisconnected(arg0: ComponentName) {
      mServiceBound = false
    }
  }

  override fun onCreate() {
    Log.d(TAG,"CarPlayService onCreate")
    super.onCreate()
    reactInstanceManager =
      (application as ReactApplication).reactNativeHost.reactInstanceManager

    emitter = EventEmitter(reactContext = reactInstanceManager.currentReactContext)
  }

  override fun createHostValidator(): HostValidator {
    return HostValidator.ALLOW_ALL_HOSTS_VALIDATOR
  }

  override fun onCreateSession(sessionInfo: SessionInfo): Session {
    Log.d(TAG, "onCreateSession: sessionId = ${sessionInfo.sessionId}, display = ${sessionInfo.displayType}")
    val session = CarPlaySession(reactInstanceManager)
    
    session.lifecycle.addObserver(object : DefaultLifecycleObserver {
      override fun onCreate(owner: LifecycleOwner) {
        super.onCreate(owner)

        // let the headlessTask know that AA is ready and make sure Timers are working even when the screen is off
        val serviceIntent =
          Intent(applicationContext, CarPlayHeadlessTaskService::class.java)
        bindService(serviceIntent, connection, BIND_AUTO_CREATE)
      }

      override fun onDestroy(owner: LifecycleOwner) {
        super.onDestroy(owner)

        if (mServiceBound) {
          unbindService(connection)
          mServiceBound = false
        }
      }
    })
    
    return session
  }

  override fun onDestroy() {
    super.onDestroy()
    emitter.didFinish()
  }

  companion object {
    var TAG = "CarPlayService"
  }
}
