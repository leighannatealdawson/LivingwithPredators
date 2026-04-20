import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
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

      <header className="space-y-2">
        <h1 className="!font-serif">
          Living with Predators- Share your experience acorss the island of Ireland V2
        </h1>
      </header>

      <div className="space-y-4 text-stone-700">
        <p>
          This research is being carried out as part of a PhD at the University of Ulster, within the School of Geography and Environmental Sciences. The study aims to examine public views and experiences relating to wildlife in Ireland in order to inform wildlife management, conservation planning, and evidence-based decision-making, and will also contribute to academic research in this field.
        </p>

        <p><strong>Please read the following information carefully before continuing.</strong></p>

        <p>
          Participation in this study is entirely voluntary. You may withdraw from the survey at any time prior to submitting your responses, for any reason. Once the survey has been submitted, all responses are fully anonymous and cannot be withdrawn.
        </p>

        <p>
          By submitting this survey, you indicate your consent for your responses to be used for scientific research purposes. All data collected are anonymous and confidential and may be used in academic publications, reports, and presentations. No personally identifiable information will be collected or stored.
        </p>

        <p>
          Participants are asked to respond honestly and to the best of their ability. There are no right or wrong answers.
        </p>

        <p>
          This research has received full ethical approval from Ulster University and is being conducted in accordance with the University’s ethical guidelines for research involving human participants.
        </p>

        <p>Please only complete this survey once.</p>

        <p>
          If you require further information about this study or wish to make contact regarding the research, please contact:
        </p>

        <p>
          By proceeding with this survey, you confirm that you are aged 18 years or over and that you have read and understood the information provided above and reside on the island of Ireland. If you have any questions about the study, you can contact the researcher Leighanna Teal Dawson using emial teal-dawson_l@ulster.ac.uk
        </p>
      </div>

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
              <span className="mt-1 block text-sm text-stone-600">
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