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
        This research is being conducted as part of a PhD within the{" "}
        <strong>School of Geography and Environmental Sciences at Ulster University</strong>. The
        study examines public views and experiences relating to foxes and pine martens on the
        island of Ireland, to inform wildlife management.
      </p>

      <h2>What does taking part involve?</h2>
      <ul>
        <li>Answering roughly 40 short questions — most are sliders you adjust.</li>
        <li>Completion typically takes around 8–10 minutes.</li>
        <li>You can stop at any time before submitting; nothing is saved until you submit.</li>
      </ul>

      <h2>What information do we collect?</h2>
      <ul>
        <li>Your answers to the survey questions.</li>
        <li>
          Your <strong>postcode</strong> (BT postcode for Northern Ireland, or Eircode for the
          Republic of Ireland) so we can understand how views vary across Ireland.
        </li>
        <li>
          We do <strong>not</strong> collect your name, email address, phone number, IP address, or
          any other identifying information.
        </li>
      </ul>
      <p className="text-sm">
        When answering any free-text questions, please <strong>do not include identifying
        information</strong> about yourself or other people (names, addresses, phone numbers).
      </p>

      <h2>How will the information be used?</h2>
      <ul>
        <li>Responses are stored securely in a spreadsheet controlled by the researcher.</li>
        <li>Aggregated findings may be published as part of the researcher's PhD thesis and in academic articles.</li>
        <li>
          Because responses are anonymous and cannot be linked back to you, <strong>once
          submitted they cannot be withdrawn</strong>. You may close this page at any point before
          submitting to withdraw.
        </li>
      </ul>

      <h2>Questions?</h2>
      <p>
        If you have any questions about the study, you can contact the researcher{" "}
        <em>[TODO(researcher): add contact email]</em>.
      </p>
    </div>
  );
}
