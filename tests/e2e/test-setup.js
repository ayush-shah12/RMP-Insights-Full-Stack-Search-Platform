import { test as base, chromium } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

export const test = base.extend({
  context: async ({ }, use) => {
    const extensionPath = path.join(__dirname, '../../v2-client-react-ts');

    // build is done in the ci/cd pipeline prior to running tests

    // console.log('Building React extension...');
    // try {
    //   execSync('npm run build', { 
    //     cwd: extensionPath, 
    //     stdio: 'inherit' 
    //   });
    // } catch (error) {
    //   console.error('Failed to build extension:', error);
    //   throw error;
    // }
    
    const pathToExtension = path.join(extensionPath, 'build');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--headless=chrome`,
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent('serviceworker');
    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});
export const expect = test.expect;
	