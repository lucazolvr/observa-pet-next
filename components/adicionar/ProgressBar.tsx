type Props = { step: 1 | 2 | 3 | 4 }

export default function ProgressBar({ step }: Props) {
  return (
    <div className="flex gap-1.5 px-5 pt-4 pb-2">
      {([1, 2, 3, 4] as const).map(n => (
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
