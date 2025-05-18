package org.birkir.carplay.utils

import android.app.Presentation
import android.content.Context
import android.graphics.Rect
import android.hardware.display.DisplayManager
import android.os.Bundle
import android.util.Log
import android.view.Display
import android.view.ViewGroup
import androidx.car.app.AppManager
import androidx.car.app.CarContext
import androidx.car.app.SurfaceCallback
import androidx.car.app.SurfaceContainer
import com.facebook.react.ReactApplication
import com.facebook.react.ReactRootView

/**
 * Renders the view tree into a surface using VirtualDisplay. It runs the ReactNative component registered
 */
class VirtualRenderer(private val context: CarContext, private val moduleName: String) {

  private var rootView: ReactRootView? = null
  private var emitter: EventEmitter

  init {
    val reactContext =  (context.applicationContext as ReactApplication).reactNativeHost.reactInstanceManager.currentReactContext
    emitter = EventEmitter(reactContext = reactContext, templateId = moduleName)

    context.getCarService(AppManager::class.java).setSurfaceCallback(object : SurfaceCallback {

      var height = 0
      var width = 0

      override fun onSurfaceAvailable(surfaceContainer: SurfaceContainer) {
        val surface = surfaceContainer.surface
        if (surface == null) {
          Log.w(TAG, "surface is null")
        } else {
          renderPresentation(surfaceContainer)
        }

        height = surfaceContainer.height
        width = surfaceContainer.width
      }

      override fun onClick(x: Float, y: Float) {
        super.onClick(x, y)
      }

      override fun onScale(focusX: Float, focusY: Float, scaleFactor: Float) {
        super.onScale(focusX, focusY, scaleFactor)
      }

      override fun onScroll(distanceX: Float, distanceY: Float) {
        emitter.didUpdatePanGestureWithTranslation(-distanceX, -distanceY)
      }

      override fun onStableAreaChanged(stableArea: Rect) {
        super.onStableAreaChanged(stableArea)
      }

      override fun onVisibleAreaChanged(visibleArea: Rect) {
        val top = visibleArea.top
        val bottom = height - visibleArea.bottom
        val left = visibleArea.left
        val right = width - visibleArea.right
        emitter.safeAreaInsetsDidChange(top = top, bottom = bottom, left = left, right = right)
      }
    })
  }

  private fun renderPresentation(container: SurfaceContainer) {
    val manager = context.getSystemService(Context.DISPLAY_SERVICE) as DisplayManager
    val display = manager.createVirtualDisplay(
      "AndroidAutoMapTemplate",
      container.width,
      container.height,
      container.dpi,
      container.surface,
      DisplayManager.VIRTUAL_DISPLAY_FLAG_PRESENTATION,
    )
    val presentation = MapPresentation(context, display.display, moduleName, container)
    presentation.show()
  }

  inner class MapPresentation(private val context: CarContext, display: Display, private val moduleName: String, private val container: SurfaceContainer) :
    Presentation(context, display) {
    override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(savedInstanceState)
      val instanceManager =
        (context.applicationContext as ReactApplication).reactNativeHost.reactInstanceManager
      if (rootView == null) {
        Log.d(TAG, "onCreate: rootView is null, initializing rootView")
        val initialProperties = Bundle().apply {
          putString("id", moduleName)
          putString("colorScheme", if (context.isDarkMode) "dark" else "light")
          putBundle("window", Bundle().apply {
            putInt("height", container.height)
            putInt("width", container.width)
            putFloat("scale", context.resources.displayMetrics.density)
          })
        }
        rootView = ReactRootView(context).apply {
          startReactApplication(instanceManager, moduleName, initialProperties)
          runApplication()
        }
      } else {
        (rootView?.parent as? ViewGroup)?.removeView(rootView)
      }
      rootView?.let {
        setContentView(it)
      }
    }
  }

  companion object {
    const val TAG = "VirtualRenderer"
  }
}
