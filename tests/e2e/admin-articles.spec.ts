import { test, expect } from '@playwright/test'

// Timestamp único por run — evita colisão com artigos de runs anteriores
const RUN = Date.now()

test.describe('Admin – Artigos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Artigos' }).click()
    await expect(page.getByRole('button', { name: /Novo artigo/i })).toBeVisible()
  })

  test('salvar artigo como rascunho', async ({ page }) => {
    await page.getByRole('button', { name: /Novo artigo/i }).click()

    const title = `[E2E-${RUN}] Artigo rascunho`
    await page.locator('[name="title"]').fill(title)
    await page.locator('[name="category"]').selectOption('cuidados')
    await page.locator('[name="excerpt"]').fill('Resumo de teste gerado pelo E2E.')
    // Body é textarea controlada (sem name attr) — identificar pelo placeholder
    await page.locator('textarea[placeholder*="Título"]').fill('## Conteúdo\n\nEste artigo foi criado pelo teste automatizado.')

    // Salvar sem published_at = rascunho
    await page.getByRole('button', { name: /Salvar rascunho/i }).click()

    // Esperar fechar o editor (onDone chama setEditing(null))
    await expect(page.getByRole('button', { name: /Novo artigo/i })).toBeVisible({ timeout: 10_000 })

    // Artigo deve aparecer na lista
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 15_000 })
  })

  test('publicar artigo diretamente', async ({ page }) => {
    await page.getByRole('button', { name: /Novo artigo/i }).click()

    const title = `[E2E-${RUN}] Artigo publicado`
    await page.locator('[name="title"]').fill(title)
    await page.locator('[name="category"]').selectOption('legislacao')
    await page.locator('[name="excerpt"]').fill('Resumo de legislação para teste E2E.')
    await page.locator('textarea[placeholder*="Título"]').fill('## Lei Municipal\n\nConteúdo de legislação.')
    await page.locator('[name="read_minutes"]').fill('3')

    // Botão "Publicar agora"
    await page.getByRole('button', { name: /Publicar agora/i }).click()

    await expect(page.getByRole('button', { name: /Novo artigo/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 15_000 })
  })

  test('salvar rascunho e depois publicar', async ({ page }) => {
    await page.getByRole('button', { name: /Novo artigo/i }).click()

    const title = `[E2E-${RUN}] Rascunho → publicado`
    await page.locator('[name="title"]').fill(title)
    await page.locator('[name="category"]').selectOption('campanhas')
    await page.locator('[name="excerpt"]').fill('Campanha criada em duas etapas.')
    await page.locator('textarea[placeholder*="Título"]').fill('Conteúdo da campanha.')

    // 1. Salvar como rascunho
    await page.getByRole('button', { name: /Salvar rascunho/i }).click()
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10_000 })

    // 2. Abrir o rascunho para editar — clicar no botão Pencil (ícone de lápis)
    const articleRow = page.locator('.bg-card').filter({ hasText: title }).first()
    await articleRow.getByRole('button').first().click()

    // 3. Publicar agora
    await page.getByRole('button', { name: /Publicar agora/i }).click()

    await expect(page.getByRole('button', { name: /Novo artigo/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 15_000 })
  })

  test('rejeitar salvar sem título', async ({ page }) => {
    await page.getByRole('button', { name: /Novo artigo/i }).click()

    // Deixar título vazio e tentar salvar
    await page.locator('textarea[placeholder*="Título"]').fill('Sem título.')
    await page.getByRole('button', { name: /Salvar rascunho/i }).click()

    // O browser nativo de validação de <input required> deve impedir o submit
    // Verificar que o editor ainda está aberto (não fechou)
    await expect(page.locator('[name="title"]')).toBeVisible()
  })

  test('salvar com read_minutes vazio não quebra', async ({ page }) => {
    await page.getByRole('button', { name: /Novo artigo/i }).click()

    const title = `[E2E-${RUN}] Sem tempo de leitura`
    await page.locator('[name="title"]').fill(title)
    await page.locator('[name="category"]').selectOption('eventos')
    await page.locator('[name="excerpt"]').fill('Sem read_minutes definido.')
    await page.locator('textarea[placeholder*="Título"]').fill('Conteúdo do evento.')
    // Deixar read_minutes vazio (caso de regressão do bug ZodError)

    await page.getByRole('button', { name: /Salvar rascunho/i }).click()

    // Não deve mostrar erro de Server Component render
    await expect(page.getByText('An error occurred')).not.toBeVisible({ timeout: 8_000 })
    await expect(page.getByRole('button', { name: /Novo artigo/i })).toBeVisible({ timeout: 10_000 })
    // Aguarda lista atualizar após revalidatePath (pode demorar até o router refetchar)
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 15_000 })
  })
})
