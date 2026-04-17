interface ThankYouPageProps {
  submissionId: string;
}

export function ThankYouPage({ submissionId }: ThankYouPageProps) {
  return (
    <article className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-4xl">
        <span aria-hidden="true">🌿</span>
      </div>
      <h1 className="!font-serif">Thank you for taking part</h1>
      <p className="mx-auto max-w-prose text-lg text-stone-700">
        Your response has been recorded and will contribute to research on how people across the
        island of Ireland live alongside foxes and pine martens.
      </p>
      <p className="mx-auto max-w-prose text-sm text-stone-600">
        If you know other people who might be willing to take part, please share this page with
        them. Their views matter too.
      </p>
      <p className="text-xs text-stone-500">
        Reference: <code className="rounded bg-stone-100 px-2 py-1">{submissionId.slice(0, 8)}</code>
      </p>
    </article>
  );
}
