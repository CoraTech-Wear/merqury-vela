import storageFile from './utils/storage' // 根据实际路径调整

var cacheManager = {
  // 默认缓存时间：1小时（毫秒）
  DEFAULT_CACHE_TIME: 60 * 60 * 1000,
  
  // 缓存键的前缀，用于区分普通存储和缓存
  CACHE_PREFIX: 'cache_',
  
  // 时间戳键的前缀
  TIMESTAMP_PREFIX: 'timestamp_'
}

/**
 * 设置缓存
 * @param {string} key 缓存键
 * @param {any} value 缓存值
 * @param {number} cacheTime 缓存时间（毫秒），可选，默认1小时
 * @param {Object} param 回调参数对象，包含success, fail, complete等回调
 */
cacheManager.set = function(key, value, cacheTime, param) {
  if (!param) param = {};
  
  var cacheKey = this.CACHE_PREFIX + key;
  var timestampKey = this.TIMESTAMP_PREFIX + key;
  
  var actualCacheTime = cacheTime || this.DEFAULT_CACHE_TIME;
  var timestamp = new Date().getTime();
  var expiryTime = timestamp + actualCacheTime;
  
  // 保存缓存数据
  storageFile.set({
    key: cacheKey,
    value: value,
    success: function() {
      // 保存时间戳
      storageFile.set({
        key: timestampKey,
        value: expiryTime,
        success: function() {
          if (param.success) {
            param.success(value);
          }
        },
        fail: param.fail,
        complete: param.complete
      });
    },
    fail: param.fail,
    complete: param.complete
  });
}

/**
 * 获取缓存
 * @param {string} key 缓存键
 * @param {Object} param 回调参数对象
 *   - success: 成功回调，参数为缓存值（如果缓存有效）
 *   - fail: 失败回调
 *   - complete: 完成回调
 *   - default: 默认值（当缓存不存在或过期时返回）
 */
cacheManager.get = function(key, param) {
  if (!param) param = {};
  
  var cacheKey = this.CACHE_PREFIX + key;
  var timestampKey = this.TIMESTAMP_PREFIX + key;
  var currentTime = new Date().getTime();
  
  // 先获取时间戳检查是否过期
  storageFile.get({
    key: timestampKey,
    success: function(expiryTime) {
      if (expiryTime && currentTime < parseInt(expiryTime)) {
        // 缓存未过期，获取缓存数据
        storageFile.get({
          key: cacheKey,
          success: function(cachedData) {
            if (param.success) {
              param.success(cachedData);
            }
            if (param.complete) {
              param.complete();
            }
          },
          fail: param.fail,
          complete: param.complete,
          default: param.default
        });
      } else {
        // 缓存已过期或不存在
        if (param.success) {
          param.success(param.default || null);
        }
        if (param.complete) {
          param.complete();
        }
        // 可选：自动清理过期缓存
        cacheManager.delete(key);
      }
    },
    fail: function() {
      // 时间戳获取失败，返回默认值
      if (param.success) {
        param.success(param.default || null);
      }
      if (param.complete) {
        param.complete();
      }
    },
    default: '0' // 默认过期时间为0（已过期）
  });
}

/**
 * 删除指定缓存
 * @param {string} key 缓存键
 * @param {Object} param 回调参数对象
 */
cacheManager.delete = function(key, param) {
  if (!param) param = {};
  
  var cacheKey = this.CACHE_PREFIX + key;
  var timestampKey = this.TIMESTAMP_PREFIX + key;
  
  var deleteCount = 0;
  var totalToDelete = 2;
  var checkComplete = function() {
    deleteCount++;
    if (deleteCount >= totalToDelete && param.complete) {
      param.complete();
    }
  };
  
  // 删除缓存数据
  storageFile.delete({
    key: cacheKey,
    success: function() {
      if (param.success && deleteCount === 0) {
        param.success();
      }
      checkComplete();
    },
    fail: param.fail,
    complete: checkComplete
  });
  
  // 删除时间戳
  storageFile.delete({
    key: timestampKey,
    success: function() {
      if (param.success && deleteCount === 0) {
        param.success();
      }
      checkComplete();
    },
    fail: param.fail,
    complete: checkComplete
  });
}

/**
 * 清理所有过期缓存
 * @param {Object} param 回调参数对象
 */
cacheManager.clearExpired = function(param) {
  if (!param) param = {};
  
  var currentTime = new Date().getTime();
  var expiredKeys = [];
  
  // 先获取所有数据来检查过期键
  storageFile.get({
    key: '', // 获取所有数据
    success: function(allData) {
      if (!allData) {
        if (param.success) param.success(0);
        if (param.complete) param.complete();
        return;
      }
      
      // 查找所有时间戳键
      Object.keys(allData).forEach(function(key) {
        if (key.startsWith(cacheManager.TIMESTAMP_PREFIX)) {
          var expiryTime = parseInt(allData[key]);
          if (currentTime >= expiryTime) {
            // 提取原始键名
            var originalKey = key.replace(cacheManager.TIMESTAMP_PREFIX, '');
            expiredKeys.push(originalKey);
          }
        }
      });
      
      // 删除所有过期缓存
      var deletedCount = 0;
      if (expiredKeys.length === 0) {
        if (param.success) param.success(0);
        if (param.complete) param.complete();
        return;
      }
      
      expiredKeys.forEach(function(key) {
        cacheManager.delete(key, {
          success: function() {
            deletedCount++;
            if (deletedCount === expiredKeys.length && param.success) {
              param.success(deletedCount);
            }
          },
          complete: function() {
            if (deletedCount === expiredKeys.length && param.complete) {
              param.complete();
            }
          },
          fail: param.fail
        });
      });
    },
    fail: param.fail,
    complete: param.complete
  });
}

/**
 * 清理所有缓存（包括未过期的）
 * @param {Object} param 回调参数对象
 */
cacheManager.clearAll = function(param) {
  if (!param) param = {};
  
  storageFile.get({
    key: '', // 获取所有数据
    success: function(allData) {
      if (!allData) {
        if (param.success) param.success();
        if (param.complete) param.complete();
        return;
      }
      
      var cacheKeys = [];
      Object.keys(allData).forEach(function(key) {
        if (key.startsWith(cacheManager.CACHE_PREFIX) || 
            key.startsWith(cacheManager.TIMESTAMP_PREFIX)) {
          cacheKeys.push(key);
        }
      });
      
      var deletedCount = 0;
      if (cacheKeys.length === 0) {
        if (param.success) param.success();
        if (param.complete) param.complete();
        return;
      }
      
      cacheKeys.forEach(function(key) {
        storageFile.delete({
          key: key,
          success: function() {
            deletedCount++;
            if (deletedCount === cacheKeys.length && param.success) {
              param.success();
            }
          },
          complete: function() {
            if (deletedCount === cacheKeys.length && param.complete) {
              param.complete();
            }
          },
          fail: param.fail
        });
      });
    },
    fail: param.fail,
    complete: param.complete
  });
}

/**
 * 检查缓存是否存在且未过期
 * @param {string} key 缓存键
 * @param {Function} callback 回调函数，参数为boolean表示是否存在有效缓存
 */
cacheManager.has = function(key, callback) {
  this.get(key, {
    success: function(data) {
      if (callback) {
        callback(data !== null && data !== undefined);
      }
    },
    fail: function() {
      if (callback) {
        callback(false);
      }
    }
  });
}

export default cacheManager;