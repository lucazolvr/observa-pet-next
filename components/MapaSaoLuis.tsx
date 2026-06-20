import { heatColor } from '@/lib/heatColor'
import type { HeatEntry } from '@/types'

const BAIRROS_SVG = [
  { name: "Ponta d'Areia",  points: '28,22 132,18 135,102 25,105' },
  { name: 'São Francisco',  points: '132,15 268,12 265,102 135,102' },
  { name: 'Calhau',         points: '268,18 378,22 375,102 265,102' },
  { name: 'Camboa',         points: '18,105 108,102 105,178 15,180' },
  { name: 'Centro',         points: '108,102 218,102 215,178 105,178' },
  { name: 'Bequimão',       points: '218,102 312,105 310,178 215,178' },
  { name: 'Renascença',     points: '312,105 378,102 380,175 310,178' },
  { name: 'Bacanga',        points: '12,180 108,178 105,255 10,258' },
  { name: 'Anil',           points: '108,178 218,178 215,255 105,255' },
  { name: 'João Paulo',     points: '218,178 315,178 312,255 215,255' },
  { name: 'Cohama',         points: '315,178 382,175 385,252 312,255' },
  { name: 'Coroadinho',     points: '10,258 108,255 105,332 8,335' },
  { name: 'Fátima',         points: '108,255 218,255 215,332 105,332' },
  { name: 'São Marcos',     points: '218,255 315,255 312,332 215,332' },
  { name: 'Cohatrac',       points: '315,255 388,252 385,330 312,332' },
  { name: 'Coroado',        points: '18,335 108,332 105,408 15,410' },
  { name: 'Monte Castelo',  points: '108,332 218,332 215,408 105,408' },
  { name: 'Cohab',          points: '218,332 315,332 312,408 215,408' },
  { name: 'Tirirical',      points: '315,332 382,330 380,408 312,408' },
  { name: "Olho d'Água",    points: '32,410 148,408 145,485 28,482' },
  { name: 'Vinhais',        points: '148,408 272,408 270,490 145,485' },
  { name: 'São Cristóvão',  points: '272,408 378,408 375,485 270,490' },
] as const

function centroid(points: string): [number, number] {
  const pts = points.split(' ').map(p => p.split(',').map(Number) as [number, number])
  return [
    pts.reduce((s, [x]) => s + x, 0) / pts.length,
    pts.reduce((s, [, y]) => s + y, 0) / pts.length,
  ]
}

type Props = { heatData: HeatEntry[] }

export default function MapaSaoLuis({ heatData }: Props) {
  const countMap = Object.fromEntries(
    heatData.map(h => [h.neighborhood, Number(h.count)])
  )

  return (
    <svg
      viewBox="0 0 400 500"
      className="w-full"
      role="img"
      aria-label="Mapa de calor de São Luís"
    >
      {/* Fundo — água */}
      <rect width="400" height="500" fill="#d9ecf5" rx="12" />
      {/* Contorno da ilha */}
      <polygon
        points="30,12 370,12 388,100 390,420 370,492 30,492 10,420 12,100"
        fill="#f0f3f8"
      />
      {/* Bairros */}
      {BAIRROS_SVG.map(({ name, points }) => (
        <polygon
          key={name}
          points={points}
          fill={heatColor(countMap[name] ?? 0)}
          stroke="#e2e8f2"
          strokeWidth="1.5"
          className="transition-colors duration-500"
        >
          <title>{name}: {countMap[name] ?? 0} avistamento(s)</title>
        </polygon>
      ))}
      {/* Labels */}
      {BAIRROS_SVG.map(({ name, points }) => {
        const [cx, cy] = centroid(points)
        const label = name.split(' ')[0]
        return (
          <text
            key={`lbl-${name}`}
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7.5"
            fill="#36425a"
            className="pointer-events-none select-none"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
