import { test as setup, expect } from '@playwright/test'
import path from 'path'

const AUTH_FILE = path.join('tests/e2e/.auth', 'admin.json')

setup('autenticar como admin', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('seu@email.com').fill('e2e-admin@observapet.test')
  await page.locator('input[type="password"]').first().fill('E2eAdmin#2026')
  await page.locator('form').getByRole('button', { name: /Entrar/i }).click()

  // Capturar o que a página mostra após o submit
  await page.waitForTimeout(5000)
  const url  = page.url()
  const body = await page.locator('body').innerText()
  console.log('URL após login:', url)
  console.log('Conteúdo (primeiros 400 chars):', body.slice(0, 400))

  await expect(page).toHaveURL('/', { timeout: 20_000 })
  await page.context().storageState({ path: AUTH_FILE })
})
