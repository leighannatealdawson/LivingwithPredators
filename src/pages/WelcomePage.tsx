import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { ConsentContent } from "../survey/consent-content";
import { usePageAssetExists } from "../util/use-asset";

interface WelcomePageProps {
  consented: boolean;
  onConsentChange: (v: boolean) => void;
  onStart: () => void;
}

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
    <article className="space-y-8">

      {consentImageExists && (
        <figure>
          <img
            src={import.meta.env.BASE_URL + "species/Consent.png"}
            alt=""
            className="w-full rounded-xl border border-stone-200"
          />
        </figure>
      )}

      <header className="space-y-4">
        <h1 className="!font-serif">
          Living with Predators- Share your experience across the island of Ireland
        </h1>

        <p className="text-stone-700">
          This research is being carried out as part of a PhD at the <strong>University of Ulster</strong>, within the <strong>School of Geography and Environmental Sciences</strong>.
        </p>

        <p className="text-stone-700">
          The study aims to examine <strong>public views and experiences relating to wildlife on the island of Ireland</strong> in order to inform wildlife management, conservation planning, and evidence-based decision-making, and will also contribute to academic research in this field.
        </p>
      </header>

      <ConsentContent />

      <div className="rounded-xl border border-forest-200 bg-forest-50 p-5">
                  <Checkbox
            checked={consented}
            onChange={(e) => {
              onConsentChange(e.target.checked);
              if (e.target.checked) setAttempted(false);
            }}
            label={
              <span>
                <strong>I confirm the following:</strong>

                <ul className="mt-2 list-disc pl-5 text-sm text-stone-700 space-y-1">
                  <li>I am aged 18 years or over</li>
                  <li>I reside on the island of Ireland</li>
                  <li>I have read the information provided above</li>
                </ul>

                <span className="mt-2 block text-sm text-stone-600">
                  Ticking this box is required to start the survey.
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

      <div className="flex justify-end">
        <Button size="lg" onClick={tryStart} disabled={!consented}>
          Start survey
        </Button>
      </div>

    </article>
  );
}