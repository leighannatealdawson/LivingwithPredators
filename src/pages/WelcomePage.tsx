export function WelcomePage({ consented, onConsentChange, onStart }: WelcomePageProps) {
  const consentImageExists = usePageAssetExists("species/Consent.png");
  const [attempted, setAttempted] = useState(false);

  const tryStart = () => {
    if (!consented) {
      setAttempted(true);
      return;
    }
    onStart();
  };

  return (
    <article className="space-y-6">

      {consentImageExists && (
        <figure>
          <img
            src={import.meta.env.BASE_URL + "species/Consent.png"}
            alt=""
            className="w-full rounded-xl border border-stone-200"
          />
        </figure>
      )}

      {/* Title */}
      <header className="space-y-2">
        <h1 className="!font-serif">
          Living with Predators- Share your experience across the island of Ireland
        </h1>
      </header>

      {/* FULL CONSENT TEXT (your exact structure) */}
      <div className="space-y-3 text-stone-800">

        <p>
          This research is being carried out as part of a PhD at the University of Ulster, within the School of Geography and Environmental Sciences.
        </p>

        <p>
          The study aims to examine public views and experiences relating to wildlife in Ireland in order to inform wildlife management, conservation planning, and evidence-based decision-making, and will also contribute to academic research in this field.
        </p>

        <p className="font-medium">
          Please read the following information carefully before continuing.
        </p>

        <p>
          Participation is entirely voluntary. You may withdraw from the survey at any time before submitting your responses, for any reason.
        </p>

        <p>
          Once submitted, all responses are fully anonymous.
        </p>

        <p>
          By submitting this survey, you give consent for your responses to be used for scientific research purposes. All data collected are anonymous, and may be used in academic publications, reports, and presentations. No personally identifiable information will be collected or stored.
        </p>

        <p>
          Participants are asked to respond honestly and to the best of their ability. There are no right or wrong answers.
        </p>

        <p>
          This research has received full ethical approval from Ulster University and is being conducted in accordance with the University’s ethical guidelines for research involving human participants.
        </p>

        <p className="font-medium">
          Please only complete this survey once.
        </p>

      </div>

      {/* CHECKBOX */}
      <div className="rounded-xl border border-forest-200 bg-forest-50 p-5">
        <Checkbox
          checked={consented}
          onChange={(e) => {
            onConsentChange(e.target.checked);
            if (e.target.checked) setAttempted(false);
          }}
          label={
            <span>
              <strong>I have read the information above and consent to taking part.</strong>
              <span className="mt-2 block text-sm text-stone-600">
                You are over 18 years old<br />
                You reside on the island of Ireland.
              </span>
            </span>
          }
        />

        {attempted && !consented && (
          <p className="mt-3 text-sm text-red-700">
            Please tick the box above to confirm you consent before starting.
          </p>
        )}
      </div>

      {/* BUTTON */}
      <div className="flex justify-end">
        <Button size="lg" onClick={tryStart} disabled={!consented}>
          Start survey
        </Button>
      </div>

    </article>
  );
}