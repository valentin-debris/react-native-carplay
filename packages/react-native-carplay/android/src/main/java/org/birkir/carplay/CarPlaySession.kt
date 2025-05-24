package org.birkir.carplay

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.car.app.SessionInfo
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.appregistry.AppRegistry
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import org.birkir.carplay.parser.RCTMapTemplate
import org.birkir.carplay.screens.CarScreen
import org.birkir.carplay.screens.CarScreenContext
import org.birkir.carplay.utils.EventEmitter
import java.util.WeakHashMap
import kotlin.coroutines.resume

class CarPlaySession(
  private val reactInstanceManager: ReactInstanceManager,
  sessionInfo: SessionInfo
) : Session(), DefaultLifecycleObserver, LifecycleEventListener {
  private lateinit var screen: CarScreen
  private val isCluster = sessionInfo.displayType == SessionInfo.DISPLAY_TYPE_CLUSTER
  private lateinit var reactContext: ReactContext

  val restartReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      if (CarPlayModule.APP_RELOAD == intent.action) {
        invokeStartTask()
      }
    }
  }

  override fun onCreateScreen(intent: Intent): Screen {
    Log.d(TAG, "On create screen " + intent.action + " - " + intent.dataString)
    val lifecycle = lifecycle
    lifecycle.addObserver(this)

    screen = CarScreen(carContext, null, isCluster)
    screen.marker = if (isCluster) "AndroidAutoCluster" else "root"

    // Handle reload events
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      carContext.registerReceiver(
        restartReceiver,
        IntentFilter(CarPlayModule.APP_RELOAD),
        Context.RECEIVER_NOT_EXPORTED
      )
    } else {
      carContext.registerReceiver(restartReceiver, IntentFilter(CarPlayModule.APP_RELOAD))
    }

    CoroutineScope(Dispatchers.Main).launch {
      this@CarPlaySession.reactContext = getReactContext()
      reactContext.addLifecycleEventListener(this@CarPlaySession)

      // Run JS
      invokeStartTask()

      // set up cluster
      if (isCluster) {
        val emitter = EventEmitter(reactContext, "AndroidAutoCluster")
        val screenMap = WeakHashMap<String, CarScreen>().apply {
          put("AndroidAutoCluster", screen)
        }
        val carScreenContext = CarScreenContext("AndroidAutoCluster", emitter, screenMap)
        val props = Arguments.createMap()
        props.putString("type", "navigation")
        // actions are not visible on a cluster screen but we have to put one in there so AA does not crash
        props.putArray("actions", Arguments.createArray().apply {
          pushMap(Arguments.createMap().apply {
            putString("type", "appIcon")
          })
        })
        screen.setTemplate(
          RCTMapTemplate(carContext, carScreenContext).parse(props),
          "AndroidAutoCluster",
          props
        )
      }

    }

    return screen
  }


  suspend fun getReactContext(): ReactContext {
    return suspendCancellableCoroutine { continuation ->
      reactInstanceManager.currentReactContext?.let {
        continuation.resume(it)
        return@suspendCancellableCoroutine
      }

      val listener = object : ReactInstanceManager.ReactInstanceEventListener {
        override fun onReactContextInitialized(context: ReactContext) {
          reactInstanceManager.removeReactInstanceEventListener(this)
          continuation.resume(context)
        }
      }
      reactInstanceManager.addReactInstanceEventListener(listener)

      continuation.invokeOnCancellation {
        reactInstanceManager.removeReactInstanceEventListener(listener)
      }

      reactInstanceManager.createReactContextInBackground()
    }
  }

  private fun invokeStartTask() {
    try {
      val catalystInstance = reactContext.catalystInstance
      val jsAppModuleName = if (isCluster) "AndroidAutoCluster" else "AndroidAuto"
      val appParams = WritableNativeMap()
      appParams.putDouble("rootTag", 1.0)
      val appProperties = Bundle.EMPTY
      if (appProperties != null) {
        appParams.putMap("initialProps", Arguments.fromBundle(appProperties))
      }

      catalystInstance.getJSModule(AppRegistry::class.java)
        ?.runApplication(jsAppModuleName, appParams)

      val carModule = reactContext.getNativeModule(CarPlayModule::class.java)
      carModule!!.setCarContext(carContext, screen)

    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  override fun onDestroy(owner: LifecycleOwner) {
    Log.i(TAG, "onDestroy")
    val context = carContext
    // stop services here, if any
  }

  override fun onNewIntent(intent: Intent) {
    // handle intents
    Log.d(TAG, "CarPlaySession.onNewIntent")
  }

  override fun onCarConfigurationChanged(configuration: Configuration) {
    // we should report this over the bridge
    Log.d(TAG, "CarPlaySession.onCarConfigurationChanged")
  }

  companion object {
    const val TAG = "CarPlaySession"
  }

  override fun onHostDestroy() {
    carContext.finishCarApp()
  }

  override fun onHostPause() {
  }

  override fun onHostResume() {
  }
}

