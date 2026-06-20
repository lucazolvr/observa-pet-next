import { test, expect } from '@playwright/test'

test.describe('Feed público', () => {
  test('carrega o feed sem estar logado', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('São Luís, MA')).toBeVisible()
    await expect(page.locator('article')).toHaveCount(0) // pode ter 0 se DB vazio
  })

  test('busca filtra por texto', async ({ page }) => {
    await page.goto('/')
    const search = page.getByPlaceholder('Buscar animal, bairro…')
    await search.fill('cachorro')
    await page.waitForURL(/q=cachorro/)
    expect(page.url()).toContain('q=cachorro')
  })

  test('filtro por tipo atualiza URL', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Adoção' }).click()
    await page.waitForURL(/filter=adocao/)
    expect(page.url()).toContain('filter=adocao')
  })

  test('banner de login aparece para visitante', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
  })

  test('/adicionar redireciona para login se não autenticado', async ({ page }) => {
    await page.goto('/adicionar')
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain('/login')
  })
})
