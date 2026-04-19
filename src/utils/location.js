const DEFAULT_LOCATION = {
  name: '嘉应学院江北校区',
  city: '梅州',
  address: '广东省梅州市梅江区嘉应学院江北校区',
  longitude: 116.1333,
  latitude: 24.3000
}

let currentLocation = null

export function getCurrentLocation() {
  return new Promise((resolve) => {
    if (currentLocation) {
      resolve(currentLocation)
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          currentLocation = {
            name: '当前位置',
            city: '',
            address: '',
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          }
          resolve(currentLocation)
        },
        (error) => {
          console.warn('获取地理位置失败，使用默认位置:', error.message)
          currentLocation = Object.assign({}, DEFAULT_LOCATION)
          resolve(currentLocation)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000
        }
      )
    } else {
      console.warn('浏览器不支持地理位置API，使用默认位置')
      currentLocation = Object.assign({}, DEFAULT_LOCATION)
      resolve(currentLocation)
    }
  })
}

export function getDefaultLocation() {
  return Object.assign({}, DEFAULT_LOCATION)
}

export function setCurrentLocationSync() {
  return currentLocation || Object.assign({}, DEFAULT_LOCATION)
}

export default {
  getCurrentLocation,
  getDefaultLocation,
  setCurrentLocationSync
}
