import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Create directory if it doesn't exist
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Try to navigate to the home page
  await page.goto('/');

  // Check if already logged in
  const isLoggedIn = await page.locator('[data-testid="user-menu-trigger"]').isVisible({ timeout: 5000 }).catch(() => false);

  if (!isLoggedIn) {
    console.log('\n===========================================');
    console.log('🔐 수동 로그인이 필요합니다!');
    console.log('===========================================');
    console.log('1. 열린 브라우저 창으로 이동하세요');
    console.log('2. Google 로그인을 완료하세요');
    console.log('   - 이메일 입력 → Next');
    console.log('   - 비밀번호 입력 → Next');
    console.log('   - 2FA 있으면 완료');
    console.log('3. 로그인 후 자동으로 진행됩니다');
    console.log('4. 최대 5분 대기합니다');
    console.log('===========================================\n');

    // Wait for manual login - user will be redirected to login page
    await page.waitForURL('/', { timeout: 300000 }); // 5분

    // Verify logged in
    await expect(page.locator('[data-testid="user-menu-trigger"]')).toBeVisible({ timeout: 30000 });
  }

  // Save authentication state
  await page.context().storageState({ path: authFile });
  console.log('\n===========================================');
  console.log('✅ 인증 세션 저장 완료!');
  console.log('===========================================');
  console.log(`저장 위치: ${authFile}`);
  console.log('이제 모든 E2E 테스트가 자동으로 실행됩니다.');
  console.log('===========================================\n');
});
