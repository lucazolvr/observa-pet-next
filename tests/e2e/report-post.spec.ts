import { test, expect } from '@playwright/test'

const REASONS = [
  'Conteúdo impróprio ou ofensivo',
  'Imagem sensível ou explícita',
  'Informação falsa ou enganosa',
  'Maus-tratos a animais',
  'Spam ou conteúdo irrelevante',
  'Outro',
]

// Seletor do sheet modal — escapa colisão com botões do feed que têm texto parecido
const MODAL = '.fixed.bottom-0.inset-x-0'

test.describe('Denunciar post', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Esperar pelo menos um post aparecer no feed
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
  })

  test('fluxo completo – motivo "Spam"', async ({ page }) => {
    await page.getByRole('button', { name: 'Mais opções' }).first().click()

    await expect(page.locator(MODAL).getByText('Denunciar publicação')).toBeVisible()

    // Selecionar motivo dentro do modal
    await page.locator(MODAL).getByRole('button', { name: 'Spam ou conteúdo irrelevante' }).click()

    // Confirmar seleção (borda coral)
    await expect(
      page.locator(MODAL).getByRole('button', { name: 'Spam ou conteúdo irrelevante' }),
    ).toHaveClass(/border-coral/)

    await page.locator(MODAL).getByRole('button', { name: /Enviar denúncia/i }).click()

    await expect(page.locator(MODAL).getByText('Denúncia enviada')).toBeVisible({ timeout: 8_000 })
    await expect(page.locator(MODAL).getByText('Nossa equipe vai analisar este conteúdo')).toBeVisible()
  })

  test('botão enviar desabilitado sem selecionar motivo', async ({ page }) => {
    await page.getByRole('button', { name: 'Mais opções' }).first().click()
    await expect(page.locator(MODAL).getByText('Denunciar publicação')).toBeVisible()

    await expect(page.locator(MODAL).getByRole('button', { name: /Enviar denúncia/i })).toBeDisabled()
  })

  test('fechar modal sem denunciar', async ({ page }) => {
    await page.getByRole('button', { name: 'Mais opções' }).first().click()
    await expect(page.locator(MODAL).getByText('Denunciar publicação')).toBeVisible()

    // Fechar com o botão X (dentro do modal)
    await page.locator(MODAL).locator('button:has(svg.lucide-x)').click()
    await expect(page.locator(MODAL)).not.toBeVisible()
  })

  test('fechar modal clicando no overlay', async ({ page }) => {
    await page.getByRole('button', { name: 'Mais opções' }).first().click()
    await expect(page.locator(MODAL).getByText('Denunciar publicação')).toBeVisible()

    // Clicar no backdrop (fixed inset-0 bg-black/40)
    await page.locator('.fixed.inset-0.bg-black\\/40').click()
    await expect(page.locator(MODAL)).not.toBeVisible()
  })

  // Testar todos os motivos de denúncia — scoped dentro do modal para evitar strict mode
  for (const reason of REASONS) {
    test(`motivo: "${reason}"`, async ({ page }) => {
      await page.getByRole('button', { name: 'Mais opções' }).first().click()
      await expect(page.locator(MODAL).getByText('Denunciar publicação')).toBeVisible()

      await page.locator(MODAL).getByRole('button', { name: reason }).click()
      await page.locator(MODAL).getByRole('button', { name: /Enviar denúncia/i }).click()

      await expect(page.locator(MODAL).getByText('Denúncia enviada')).toBeVisible({ timeout: 8_000 })
    })
  }

})
