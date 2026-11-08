import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const failedRequests = [];
  page.on('response', res => {
    if (res.status() >= 400) {
      failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  console.log('Testing http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  console.log('Failed requests on /:', failedRequests);

  failedRequests.length = 0;
  console.log('Testing http://localhost:3000/rooms ...');
  await page.goto('http://localhost:3000/rooms', { waitUntil: 'networkidle' });
  console.log('Failed requests on /rooms:', failedRequests);

  await browser.close();
}

main().catch(console.error);
