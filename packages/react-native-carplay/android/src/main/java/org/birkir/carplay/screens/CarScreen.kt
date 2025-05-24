package org.birkir.carplay.screens

import android.util.Log
import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.model.Action
import androidx.car.app.model.ActionStrip
import androidx.car.app.model.CarIcon
import androidx.car.app.model.MessageTemplate
import androidx.car.app.model.PlaceListMapTemplate
import androidx.car.app.model.Template
import androidx.car.app.navigation.model.MapTemplate
import androidx.car.app.navigation.model.NavigationTemplate
import androidx.car.app.navigation.model.PlaceListNavigationTemplate
import androidx.car.app.navigation.model.RoutePreviewNavigationTemplate
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.ReadableMap
import org.birkir.carplay.utils.EventEmitter
import org.birkir.carplay.utils.VirtualRenderer

class CarScreen(
  carContext: CarContext, emitter: EventEmitter?, private val isCluster: Boolean = false
) : Screen(carContext) {

  var template: Template? = null
  private var virtualRenderer: VirtualRenderer? = null

  init {
    lifecycle.addObserver(object : LifecycleEventObserver {
      override fun onStateChanged(source: LifecycleOwner, event: Lifecycle.Event) {
        when (event) {
          Lifecycle.Event.ON_CREATE -> {
            emitter?.willAppear()
          }

          Lifecycle.Event.ON_RESUME -> {
            emitter?.didAppear()
          }

          Lifecycle.Event.ON_PAUSE -> {
            emitter?.willDisappear()
          }

          Lifecycle.Event.ON_DESTROY -> {
            emitter?.didDisappear()
          }

          else -> {}
        }

        if (event == Lifecycle.Event.ON_DESTROY && virtualRenderer != null) {
          Log.d(TAG, "onStateChanged: got $event, removing virtual renderer")
          virtualRenderer = null
        }
      }
    })
  }

  fun setTemplate(template: Template?, templateId: String, props: ReadableMap) {
    // allow MapTemplate, NavigationTemplate and PlaceListMapTemplate
    val isSurfaceTemplate =
      template is MapTemplate || template is NavigationTemplate || template is PlaceListMapTemplate || template is PlaceListNavigationTemplate || template is RoutePreviewNavigationTemplate

    if (isSurfaceTemplate && virtualRenderer == null) {
      Log.d(TAG, "setTemplate: received navigation template with args: $templateId")
      if (templateId == null) {
        Log.w(
          TAG,
          "setTemplate: moduleName is null, please make sure you are setting id for map-template in ReactNative",
        )
        return
      }
      virtualRenderer = VirtualRenderer(carContext, templateId, isCluster)
    }
    this.template = template
  }

  override fun onGetTemplate(): Template {
    Log.d(TAG, "onGetTemplate for $marker")
    template?.let {
      return it
    }

    if (isCluster) {
      return NavigationTemplate.Builder().apply {
        setActionStrip(ActionStrip.Builder().apply { addAction(Action.APP_ICON) }.build()).build()
      }.build()
    }

    val appNameId = carContext.resources.getIdentifier("app_name", "string", carContext.packageName)
    val appNme = if (appNameId != 0) carContext.resources.getString(appNameId) else "RNCarPlay"

    return MessageTemplate.Builder(appNme).apply {
      setIcon(CarIcon.APP_ICON)
    }.build()
  }

  companion object {
    const val TAG = "CarScreen"
  }
}
