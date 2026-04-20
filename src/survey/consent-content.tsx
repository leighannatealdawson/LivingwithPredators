export function ConsentContent() {
  return (
    <div className="space-y-10 text-stone-800">

      {/* Intro */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">About this research</h2>

        <p>
          This research is being carried out as part of a PhD at the University of Ulster, within the School of Geography and Environmental Sciences. The study aims to examine public views and experiences relating to wildlife in Ireland in order to inform wildlife management, conservation planning, and evidence-based decision-making, and will also contribute to academic research in this field.
        </p>

        <p className="font-medium">
          Please read the following information carefully before continuing.
        </p>
      </section>

      {/* Core consent block (merged) */}
      <section className="space-y-4">
        <p>
          <strong>Participation is entirely voluntary.</strong> You may withdraw from the survey at any time before submitting your responses, for any reason.
        </p>

        <p>
          Once submitted, all responses are <strong>fully anonymous and cannot be withdrawn</strong>.
        </p>

        <p>
          By submitting this survey, you give <strong>consent for your responses to be used for scientific research purposes</strong>. All data collected are anonymous and confidential and may be used in academic publications, reports, and presentations. <strong>No personally identifiable information will be collected or stored.</strong>
        </p>

        <p>
          Participants are asked to respond honestly and to the best of their ability. There are <strong>no right or wrong answers</strong>.
        </p>

        <p>
          This research has received <strong>full ethical approval from Ulster University</strong> and is being conducted in accordance with the University’s ethical guidelines for research involving human participants.
        </p>

        <p>
          <strong>Please only complete this survey once.</strong>
        </p>
      </section>

      {/* Contact */}
      <section className="border-t border-stone-200 pt-6 space-y-2">
        <p>
          If you require further information about this study or wish to make contact regarding the research, please contact:
        </p>

        <p className="font-medium">Leighanna Teal Dawson</p>
        <p>Email: <span className="font-medium">teal-dawson_l@ulster.ac.uk</span></p>
      </section>

      {/* Final confirmation */}
      <section className="rounded-lg border border-forest-200 bg-forest-50 p-5 space-y-3">
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