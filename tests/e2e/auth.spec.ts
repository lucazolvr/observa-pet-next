import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test('página de login carrega', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByPlaceholder('seu@email.com')).toBeVisible()
  })

  test('troca para modo cadastro', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /Criar conta/i }).click()
    await expect(page.getByPlaceholder('Seu nome')).toBeVisible()
  })

  test('link de esqueci senha aparece', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /Esqueci/i })).toBeVisible()
  })

  test('página de verificar email carrega', async ({ page }) => {
    await page.goto('/verificar-email?email=test@test.com')
    await expect(page.getByText(/código/i)).toBeVisible()
  })

  test('página de redefinir senha carrega', async ({ page }) => {
    await page.goto('/redefinir-senha')
    // Se não há sessão, deve mostrar OTP ou formulário
    await expect(page).not.toHaveURL(/\/login/)
  })
})
