/**
 * Consent content for the Welcome page.
 *
 * TODO(researcher): review and finalise the following before launch:
 *   - exact retention period
 *   - ethics committee reference (if any)
 *   - contact email for questions
 *   - any institutional boilerplate required by Ulster University
 */
export function ConsentContent() {
  return (
    <div className="prose prose-stone max-w-none text-stone-800">
      <h2>About this research</h2>
      <p>
        This research is being carried out as part of a PhD at the University of Ulster, within the School of Geography and Environmental Sciences. The study aims to examine public views and experiences relating to wildlife in Ireland in order to inform wildlife management, conservation planning, and evidence-based decision-making, and will also contribute to academic research in this field.
      </p>

      <h2>Please read the following information carefully before continuing.</h2>
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

      <p>
        Please only complete this survey once.
      </p>

      <p>
        If you require further information about this study or wish to make contact regarding the research, please contact:
      </p>

      <p>
        If you have any questions about the study, you can contact the researcher Leighanna Teal Dawson using emial teal-dawson_l@ulster.ac.uk
      </p>

      <p>
        By proceeding with this survey, you confirm that you are aged 18 years or over and that you have read and understood the information provided above and reside on the island of Ireland.
      </p>
    </div>
  );
}