import { testDatabaseConnection, testRedisConnection } from '../authService.js';

(async () => {
  try {
    await testDatabaseConnection();
    await testRedisConnection();
  } catch (err) {
    console.error('测试失败:', err);
  }
})();