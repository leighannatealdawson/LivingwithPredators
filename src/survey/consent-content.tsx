export function ConsentContent() {
  return (
    <div className="space-y-8 text-stone-800">

      {/* Title block */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          About this research
        </h2>

        <p className="leading-relaxed">
          This research is being carried out as part of a PhD at the University of Ulster, within the School of Geography and Environmental Sciences. The study aims to examine public views and experiences relating to wildlife in Ireland in order to inform wildlife management, conservation planning, and evidence-based decision-making, and will also contribute to academic research in this field.
        </p>
      </section>

      {/* Intro instruction */}
      <section className="pt-2">
        <h3 className="text-lg font-semibold">
          Please read the following information carefully before continuing.
        </h3>
      </section>

      {/* Participation */}
      <section className="space-y-3">
        <p>
          Participation in this study is entirely voluntary. You may withdraw from the survey at any time prior to submitting your responses, for any reason. Once the survey has been submitted, all responses are fully anonymous and cannot be withdrawn.
        </p>
      </section>

      {/* Consent */}
      <section className="space-y-3">
        <p>
          By submitting this survey, you indicate your consent for your responses to be used for scientific research purposes. All data collected are anonymous and confidential and may be used in academic publications, reports, and presentations. No personally identifiable information will be collected or stored.
        </p>
      </section>

      {/* Instructions */}
      <section className="space-y-3">
        <p>
          Participants are asked to respond honestly and to the best of their ability. There are no right or wrong answers.
        </p>
      </section>

      {/* Ethics */}
      <section className="space-y-3">
        <p>
          This research has received full ethical approval from Ulster University and is being conducted in accordance with the University’s ethical guidelines for research involving human participants.
        </p>
      </section>

      {/* Frequency reminder */}
      <section>
        <p className="font-medium">
          Please only complete this survey once.
        </p>
      </section>

      {/* Contact block (visually separated) */}
      <section className="border-t border-stone-200 pt-6 space-y-2">
        <p>
          If you require further information about this study or wish to make contact regarding the research, please contact:
        </p>

        <p className="font-medium">
          Leighanna Teal Dawson
        </p>

        <p>
          Email: <span className="font-medium">teal-dawson_l@ulster.ac.uk</span>
        </p>
      </section>

      {/* Final confirmation (boxed feel) */}
      <section className="rounded-lg border border-forest-200 bg-forest-50 p-4 space-y-2">
        <p className="font-medium">
          Final confirmation
        </p>

        <p>
          By proceeding with this survey, you confirm that you are aged 18 years or over and that you have read and understood the information provided above and reside on the island of Ireland.
        </p>

        <p className="text-sm text-stone-600">
          I have read the information above and consent to taking part. Ticking this box is required to start the survey.
        </p>
      </section>

    </div>
  );
}