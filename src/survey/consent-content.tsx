export function ConsentContent() {
  return (
    <div className="space-y-8 text-stone-800">

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">About this research</h2>
        <p>
          This research is being carried out as part of a PhD at the University of Ulster, within the School of Geography and Environmental Sciences. The study aims to examine public views and experiences relating to wildlife in Ireland in order to inform wildlife management, conservation planning, and evidence-based decision-making, and will also contribute to academic research in this field.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold">
          Please read the following information carefully before continuing.
        </h3>
      </section>

      {/* Participation */}
      <section className="space-y-3">
        <h3 className="font-semibold">Participation</h3>

        <ul className="space-y-2">
          <li>
            <strong>Participation in this study is entirely voluntary.</strong>
          </li>
          <li>
            You may <strong>withdraw from the survey at any time before submitting your responses</strong>, for any reason.
          </li>
          <li>
            Once submitted, all responses are <strong>fully anonymous and cannot be withdrawn</strong>.
          </li>
        </ul>
      </section>

      {/* Consent + data */}
      <section className="space-y-3">
        <h3 className="font-semibold">Consent and data use</h3>

        <ul className="space-y-2">
          <li>
            By submitting this survey, you give <strong>consent for your responses to be used for scientific research purposes</strong>.
          </li>
          <li>
            All data collected are <strong>anonymous and confidential</strong> and may be used in academic publications, reports, and presentations.
          </li>
          <li>
            <strong>No personally identifiable information will be collected or stored.</strong>
          </li>
        </ul>
      </section>

      {/* Instructions */}
      <section className="space-y-3">
        <h3 className="font-semibold">Instructions</h3>

        <ul className="space-y-2">
          <li>
            Participants are asked to respond honestly and to the best of their ability.
          </li>
          <li>
            There are <strong>no right or wrong answers</strong>.
          </li>
          <li>
            Please <strong>only complete this survey once</strong>.
          </li>
        </ul>
      </section>

      {/* Ethics */}
      <section>
        <p>
          This research has received <strong>full ethical approval from Ulster University</strong> and is being conducted in accordance with the University’s ethical guidelines for research involving human participants.
        </p>
      </section>

      {/* Contact */}
      <section className="border-t border-stone-200 pt-6 space-y-2">
        <p>
          If you require further information about this study or wish to make contact regarding the research, please contact:
        </p>

        <p className="font-medium">Leighanna Teal Dawson</p>
        <p>
          Email: <span className="font-medium">teal-dawson_l@ulster.ac.uk</span>
        </p>
      </section>

      {/* Final confirmation */}
      <section className="rounded-lg border border-forest-200 bg-forest-50 p-4 space-y-2">
        <p>
          By proceeding with this survey, you confirm that you are <strong>aged 18 years or over</strong>, that you have <strong>read and understood the information above</strong>, and that you <strong>reside on the island of Ireland</strong>.
        </p>

        <p className="text-sm text-stone-600">
          I have read the information above and consent to taking part. Ticking this box is required to start the survey.
        </p>
      </section>

    </div>
  );
}