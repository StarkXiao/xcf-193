import { ref, computed, onMounted, onUnmounted } from 'vue'

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440
}

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 800)
const touchSupported = ref(
  typeof window !== 'undefined' && 
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)
)

let resizeHandler = null

const initResize = () => {
  if (resizeHandler) return
  resizeHandler = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }
  window.addEventListener('resize', resizeHandler)
}

const cleanupResize = () => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
}

export function useResponsive() {
  const isMobile = computed(() => windowWidth.value < BREAKPOINTS.mobile)
  const isTablet = computed(() => 
    windowWidth.value >= BREAKPOINTS.mobile && 
    windowWidth.value < BREAKPOINTS.tablet
  )
  const isDesktop = computed(() => windowWidth.value >= BREAKPOINTS.tablet)
  const isSmallMobile = computed(() => windowWidth.value < 480)
  const isLargeMobile = computed(() => 
    windowWidth.value >= 480 && 
    windowWidth.value < BREAKPOINTS.mobile
  )
  const isTouchDevice = computed(() => touchSupported.value)

  const safeAreaInsets = computed(() => {
    if (typeof window === 'undefined') {
      return { top: 0, bottom: 0, left: 0, right: 0 }
    }
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top')) || 0,
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom')) || 0,
      left: parseInt(style.getPropertyValue('--safe-area-inset-left')) || 0,
      right: parseInt(style.getPropertyValue('--safe-area-inset-right')) || 0
    }
  })

  onMounted(() => {
    initResize()
  })

  onUnmounted(() => {
    cleanupResize()
  })

  return {
    windowWidth,
    windowHeight,
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isLargeMobile,
    isTouchDevice,
    safeAreaInsets
  }
}

export function useTouchGestures(elementRef, options = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    swipeThreshold = 50,
    tapThreshold = 10
  } = options

  let startX = 0
  let startY = 0
  let startTime = 0
  let isDragging = false

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    startTime = Date.now()
    isDragging = true
  }

  const handleTouchEnd = (e) => {
    if (!isDragging) return
    isDragging = false

    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const deltaX = endX - startX
    const deltaY = endY - startY
    const deltaTime = Date.now() - startTime

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX < tapThreshold && absY < tapThreshold && deltaTime < 300) {
      onTap?.(e)
      return
    }

    if (absX > absY) {
      if (absX > swipeThreshold) {
        if (deltaX > 0) {
          onSwipeRight?.(e)
        } else {
          onSwipeLeft?.(e)
        }
      }
    } else {
      if (absY > swipeThreshold) {
        if (deltaY > 0) {
          onSwipeDown?.(e)
        } else {
          onSwipeUp?.(e)
        }
      }
    }
  }

  const bind = () => {
    const el = elementRef.value
    if (!el) return
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  const unbind = () => {
    const el = elementRef.value
    if (!el) return
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchend', handleTouchEnd)
  }

  onMounted(bind)
  onUnmounted(unbind)

  return { bind, unbind }
}
