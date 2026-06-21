import { test as setup } from '@playwright/test'
import path from 'path'

const AUTH_FILE = path.join('tests/e2e/.auth', 'user.json')

setup('autenticar como usuário comum', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('seu@email.com').fill('e2e-user@observapet.test')
  await page.locator('input[type="password"]').first().fill('E2eUser#2026')
  await page.locator('form').getByRole('button', { name: /Entrar/i }).click()
  await page.waitForURL('/', { timeout: 15_000 })
  await page.context().storageState({ path: AUTH_FILE })
})
