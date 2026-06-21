type Props = { step: number; total?: number }

export default function ProgressBar({ step, total = 3 }: Props) {
  return (
    <div className="flex gap-1.5 px-5 pt-4 pb-2">
      {Array.from({ length: total }, (_, i) => i + 1).map(n => (
        <div
          key={n}
          className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
            n <= step ? 'bg-blue' : 'bg-border'
          }`}
        />
      ))}
    </div>
  )
}
