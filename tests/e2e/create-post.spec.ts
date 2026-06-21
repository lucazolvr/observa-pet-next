import { test, expect } from '@playwright/test'

const TIPOS = [
  { value: 'avistado',   label: 'Avistado' },
  { value: 'resgate',    label: 'Resgate urgente' },
  { value: 'adocao',     label: 'Para adoção' },
  { value: 'perdido',    label: 'Perdido' },
  { value: 'tratamento', label: 'Em tratamento' },
]

const SPECIES = [
  { value: 'cachorro', label: 'Cachorro' },
  { value: 'gato',     label: 'Gato' },
  { value: 'outro',    label: 'Outro' },
]

const STATUS_LABELS = [
  'Avistado', 'Urgente', 'Para adoção', 'Tratamento', 'Resgatado',
]

async function preencherFormulario(
  page: import('@playwright/test').Page,
  tipo: string,
  species: string,
  statusLabel: string,
) {
  // Etapa 1 — botões têm emoji + texto, usar regex
  await page.goto('/adicionar')
  await page.getByRole('button', { name: new RegExp(tipo) }).click()
  await page.getByRole('button', { name: 'Próximo' }).click()

  // Etapa 2 — espécie + status
  await page.getByRole('button', { name: new RegExp(species) }).click()
  await page.getByRole('button', { name: new RegExp(statusLabel) }).click()
  await page.getByRole('button', { name: 'Próximo' }).click()

  // Etapa 3 — ficha clínica (opcionais, avançar direto)
  await page.getByRole('button', { name: 'Próximo' }).click()

  // Etapa 4 — localização
  await page.locator('textarea[placeholder="Descreva o que você viu…"]').fill(
    `[E2E] Post tipo=${tipo} species=${species}`,
  )
  await page.getByRole('button', { name: /Salvar animal/i }).click()
}

test.describe('Criar Post – variações de tipo', () => {
  for (const tipo of TIPOS) {
    test(`tipo: ${tipo.label}`, async ({ page }) => {
      await preencherFormulario(page, tipo.label, 'Cachorro', 'Avistado')
      await page.waitForURL(/\/pet\//, { timeout: 20_000 })
      expect(page.url()).toMatch(/\/pet\/[a-z0-9-]+/)
    })
  }
})

test.describe('Criar Post – variações de espécie', () => {
  for (const sp of SPECIES) {
    test(`espécie: ${sp.label}`, async ({ page }) => {
      await preencherFormulario(page, 'Avistado', sp.label, 'Avistado')
      await page.waitForURL(/\/pet\//, { timeout: 20_000 })
      expect(page.url()).toMatch(/\/pet\/[a-z0-9-]+/)
    })
  }
})

test.describe('Criar Post – variações de status', () => {
  for (const statusLabel of STATUS_LABELS) {
    test(`status: ${statusLabel}`, async ({ page }) => {
      await preencherFormulario(page, 'Avistado', 'Cachorro', statusLabel)
      await page.waitForURL(/\/pet\//, { timeout: 20_000 })
      expect(page.url()).toMatch(/\/pet\/[a-z0-9-]+/)
    })
  }
})

test.describe('Criar Post – validações de formulário', () => {
  test('não avança etapa 1 sem selecionar tipo', async ({ page }) => {
    await page.goto('/adicionar')
    await page.getByRole('button', { name: 'Próximo' }).click()
    await expect(page.getByText('Selecione o tipo de aviso')).toBeVisible()
  })

  test('não avança etapa 2 sem espécie', async ({ page }) => {
    await page.goto('/adicionar')
    await page.getByRole('button', { name: /Avistado/ }).first().click()
    await page.getByRole('button', { name: 'Próximo' }).click()
    // Só selecionar status, não espécie
    await page.getByRole('button', { name: /Avistado/ }).last().click()
    await page.getByRole('button', { name: 'Próximo' }).click()
    await expect(page.getByText('Selecione a espécie')).toBeVisible()
  })

})
