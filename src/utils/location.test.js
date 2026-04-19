import locationUtil from './location.js'

console.log('=== 定位功能测试 ===')
console.log('')

console.log('1. 默认位置:')
console.log(locationUtil.getDefaultLocation())
console.log('')

console.log('2. 同步获取位置 (立即返回默认值):')
console.log(locationUtil.setCurrentLocationSync())
console.log('')

console.log('3. 异步获取位置 (将尝试浏览器定位):')
locationUtil.getCurrentLocation().then(location => {
  console.log(location)
})
