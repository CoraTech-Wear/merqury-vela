// LocalCacheManager.ts - 适配文件存储的版本

/**
 * 文件存储接口 - 基于提供的 storageFile API
 */
interface FileStorageAdapter {
  get(param: {
    key: string;
    default?: string;
    success?: (data: string) => void;
    complete?: () => void;
  }): void;

  set(param: {
    key: string;
    value: string;
    success?: () => void;
    fail?: (data: any, code: number) => void;
    complete?: () => void;
  }): void;

  save(data: any, param: {
    success?: () => void;
    fail?: (data: any, code: number) => void;
    complete?: () => void;
  }): void;

  clear(param?: {
    success?: () => void;
    fail?: (data: any, code: number) => void;
    complete?: () => void;
  }): void;

  delete(param: {
    key: string;
    success?: () => void;
    fail?: (data: any, code: number) => void;
    complete?: () => void;
  }): void;
}

/**
 * 缓存项接口
 */
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
}

/**
 * 时间范围接口
 */
interface TimeRange {
  start?: number;
  end?: number;
}

/**
 * 异步操作结果接口
 */
interface AsyncResult<T = any> {
  success?: (data: T) => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

/**
 * 本地缓存管理类 - 适配文件存储的异步版本
 */
class LocalCacheManager {
  private storage: FileStorageAdapter;
  private data: Record<string, CacheItem> = {};
  private initialized: boolean = false;
  private initCallbacks: Array<() => void> = [];

  /**
   * 构造函数
   * @param storageAdapter 文件存储适配器
   */
  constructor(storageAdapter: FileStorageAdapter) {
    this.storage = storageAdapter;
    this.initialize();
  }

  /**
   * 初始化缓存数据
   */
  private initialize(): void {
    this.storage.get({
      key: 'cache_data',
      default: '{}',
      success: (dataStr: string) => {
        if (dataStr !== '') {
          try {
            this.data = JSON.parse(dataStr);
            this.initialized = true;
            this.executeInitCallbacks();
          } catch (error) {
            console.error('解析缓存数据失败:', error);
            this.data = {};
            this.initialized = true;
            this.executeInitCallbacks();
          }
        } else {
          console.error('读取缓存数据失败');
          this.data = {};
          this.initialized = true;
          this.executeInitCallbacks();
        }

      }
    });
  }

  /**
   * 执行初始化回调
   */
  private executeInitCallbacks(): void {
    while (this.initCallbacks.length > 0) {
      const callback = this.initCallbacks.shift();
      if (callback) {
        try {
          callback();
        } catch (error) {
          console.error('初始化回调执行失败:', error);
        }
      }
    }
  }

  /**
   * 等待初始化完成
   */
  private waitForInitialization(callback: () => void): void {
    if (this.initialized) {
      callback();
    } else {
      this.initCallbacks.push(callback);
    }
  }

  /**
   * 保存数据到存储
   */
  private saveToStorage(param?: {
    success?: () => void;
    fail?: (error: any) => void;
    complete?: () => void;
  }): void {
    this.storage.save(this.data, {
      success: () => {
        param?.success?.();
      },
      fail: (data: any, code: number) => {
        param?.fail?.(new Error(`存储失败，错误码: ${code}`));
      },
      complete: () => {
        param?.complete?.();
      }
    });
  }

  /**
   * 存储数据
   * @param key 存储键
   * @param data 要存储的数据
   * @param customTimestamp 自定义时间戳（毫秒），默认为当前时间
   * @param callbacks 异步回调
   */
  set<T>(
    key: string,
    data: T,
    customTimestamp?: number,
    callbacks?: AsyncResult<boolean>
  ): void {
    this.waitForInitialization(() => {
      try {
        const timestamp = customTimestamp || Date.now();

        this.data[key] = {
          data: data,
          timestamp: timestamp
        };

        this.saveToStorage({
          success: () => {
            callbacks?.success?.(true);
          },
          fail: (error) => {
            console.error(`存储数据失败 (key: ${key}):`, error);
            callbacks?.fail?.(error);
          },
          complete: () => {
            callbacks?.complete?.();
          }
        });
      } catch (error) {
        console.error(`存储数据失败 (key: ${key}):`, error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 获取数据
   * @param key 存储键
   * @param timeRange 时间范围
   * @param callbacks 异步回调
   */
  get<T>(
    key: string,
    timeRange?: TimeRange,
    callbacks?: AsyncResult<T | null>
  ): void {
    this.waitForInitialization(() => {
      try {
        if (!this.data[key]) {
          callbacks?.success?.(null);
          callbacks?.complete?.();
          return;
        }

        const cacheItem = this.data[key] as CacheItem<T>;

        // 检查时间范围
        if (timeRange && !this.isInTimeRange(cacheItem.timestamp, timeRange)) {
          callbacks?.success?.(null);
          callbacks?.complete?.();
          return;
        }

        callbacks?.success?.(cacheItem.data);
        callbacks?.complete?.();
      } catch (error) {
        console.error(`获取数据失败 (key: ${key}):`, error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 获取缓存项（包含元数据）
   * @param key 存储键
   * @param timeRange 时间范围
   * @param callbacks 异步回调
   */
  getItem<T>(
    key: string,
    timeRange?: TimeRange,
    callbacks?: AsyncResult<(CacheItem<T> & { key: string }) | null>
  ): void {
    this.waitForInitialization(() => {
      try {
        if (!this.data[key]) {
          callbacks?.success?.(null);
          callbacks?.complete?.();
          return;
        }

        const cacheItem = this.data[key] as CacheItem<T>;

        // 检查时间范围
        if (timeRange && !this.isInTimeRange(cacheItem.timestamp, timeRange)) {
          callbacks?.success?.(null);
          callbacks?.complete?.();
          return;
        }

        const result = {
          data: cacheItem.data,
          timestamp: cacheItem.timestamp,
          key: key
        };

        callbacks?.success?.(result);
        callbacks?.complete?.();
      } catch (error) {
        console.error(`获取缓存项失败 (key: ${key}):`, error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 删除数据
   * @param key 存储键
   * @param callbacks 异步回调
   */
  remove(
    key: string,
    callbacks?: AsyncResult<boolean>
  ): void {
    this.waitForInitialization(() => {
      try {
        delete this.data[key];

        this.saveToStorage({
          success: () => {
            callbacks?.success?.(true);
          },
          fail: (error) => {
            console.error(`删除数据失败 (key: ${key}):`, error);
            callbacks?.fail?.(error);
          },
          complete: () => {
            callbacks?.complete?.();
          }
        });
      } catch (error) {
        console.error(`删除数据失败 (key: ${key}):`, error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 清空所有缓存数据
   * @param callbacks 异步回调
   */
  clear(callbacks?: AsyncResult<boolean>): void {
    this.waitForInitialization(() => {
      try {
        this.data = {};

        this.storage.clear({
          success: () => {
            callbacks?.success?.(true);
          },
          fail: (data: any, code: number) => {
            console.error('清空缓存失败:', data);
            callbacks?.fail?.(new Error(`清空失败，错误码: ${code}`));
          },
          complete: () => {
            callbacks?.complete?.();
          }
        });
      } catch (error) {
        console.error('清空缓存失败:', error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 获取所有键名
   * @param callbacks 异步回调
   */
  keys(callbacks?: AsyncResult<string[]>): void {
    this.waitForInitialization(() => {
      try {
        const keys = Object.keys(this.data);
        callbacks?.success?.(keys);
        callbacks?.complete?.();
      } catch (error) {
        console.error('获取键列表失败:', error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 检查键是否存在
   * @param key 存储键
   * @param callbacks 异步回调
   */
  has(
    key: string,
    callbacks?: AsyncResult<boolean>
  ): void {
    this.waitForInitialization(() => {
      try {
        const exists = key in this.data;
        callbacks?.success?.(exists);
        callbacks?.complete?.();
      } catch (error) {
        console.error(`检查键存在失败 (key: ${key}):`, error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 获取缓存项的时间戳
   * @param key 存储键
   * @param callbacks 异步回调
   */
  getTimestamp(
    key: string,
    callbacks?: AsyncResult<number | null>
  ): void {
    this.waitForInitialization(() => {
      try {
        if (!this.data[key]) {
          callbacks?.success?.(null);
          callbacks?.complete?.();
          return;
        }

        const timestamp = this.data[key].timestamp;
        callbacks?.success?.(timestamp);
        callbacks?.complete?.();
      } catch (error) {
        console.error(`获取时间戳失败 (key: ${key}):`, error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 获取所有在指定时间范围内的数据
   * @param timeRange 时间范围
   * @param callbacks 异步回调
   */
  getAllInTimeRange<T>(
    timeRange: TimeRange,
    callbacks?: AsyncResult<Array<{ key: string; data: T; timestamp: number }>>
  ): void {
    this.waitForInitialization(() => {
      try {
        const result: Array<{ key: string; data: T; timestamp: number }> = [];
        const keys = Object.keys(this.data);

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          try {
            const cacheItem = this.data[key] as CacheItem<T>;

            if (this.isInTimeRange(cacheItem.timestamp, timeRange)) {
              result.push({
                key: key,
                data: cacheItem.data,
                timestamp: cacheItem.timestamp
              });
            }
          } catch (error) {
            console.error(`解析缓存项失败 (key: ${key}):`, error);
          }
        }

        callbacks?.success?.(result);
        callbacks?.complete?.();
      } catch (error) {
        console.error('获取时间范围内数据失败:', error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 获取所有缓存项
   * @param callbacks 异步回调
   */
  getAll<T>(
    callbacks?: AsyncResult<Array<{ key: string; data: T; timestamp: number }>>
  ): void {
    this.waitForInitialization(() => {
      try {
        const result: Array<{ key: string; data: T; timestamp: number }> = [];
        const keys = Object.keys(this.data);

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          try {
            const cacheItem = this.data[key] as CacheItem<T>;
            result.push({
              key: key,
              data: cacheItem.data,
              timestamp: cacheItem.timestamp
            });
          } catch (error) {
            console.error(`解析缓存项失败 (key: ${key}):`, error);
          }
        }

        callbacks?.success?.(result);
        callbacks?.complete?.();
      } catch (error) {
        console.error('获取所有数据失败:', error);
        callbacks?.fail?.(error);
        callbacks?.complete?.();
      }
    });
  }

  /**
   * 检查时间戳是否在指定范围内
   * @param timestamp 要检查的时间戳
   * @param timeRange 时间范围
   * @returns 是否在范围内
   */
  private isInTimeRange(timestamp: number, timeRange: TimeRange): boolean {
    const { start, end } = timeRange;

    if (start !== undefined && timestamp < start) {
      return false;
    }

    if (end !== undefined && timestamp > end) {
      return false;
    }

    return true;
  }

  /**
   * 检查是否已初始化
   * @returns 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// 导出类型和类
export { LocalCacheManager };
export type { FileStorageAdapter, CacheItem, TimeRange, AsyncResult };