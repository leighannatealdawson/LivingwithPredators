import { useEffect, useState } from "react";
import { useWizard } from "./use-wizard";
import { PageRenderer } from "./PageRenderer";
import { wizardPages } from "./pages";
import { WelcomePage } from "../pages/WelcomePage";
import { ThankYouPage } from "../pages/ThankYouPage";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { submit, type SubmitResult } from "./submit";
import { clearState } from "./persistence";
import { usePageAssetExists } from "../util/use-asset";

export function SurveyWizard() {
  const wiz = useWizard();
  const page = wizardPages.find((p) => p.id === wiz.currentStepId)!;
  const isFirst = wiz.currentIndex === 0;
  const isThanks = wiz.currentStepId === "thanks";
  const isDemographics = wiz.currentStepId === "demographics";
  const isIntro = wiz.currentStepId === "intro";

  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const foxExists = usePageAssetExists("species/fox.jpg");
  const pmExists = usePageAssetExists("species/pm.jpg");
  const base = import.meta.env.BASE_URL;

  const handleSubmit = async () => {
    setSubmitStatus("submitting");
    setSubmitError(null);
    const result: SubmitResult = await submit(
      wiz.state.submissionId,
      wiz.state.startedAt,
      wiz.state.answers,
    );
    if (result.ok) {
      clearState();
      setSubmitStatus("idle");
      wiz.goTo("thanks");
    } else {
      setSubmitStatus("error");
      setSubmitError(result.message);
    }
  };

  useEffect(() => {
    if (!isDemographics) setSubmitStatus("idle");
  }, [isDemographics]);

  // Per-question inline images on the intro page.
  const introInlineBefore = isIntro
    ? {
        species_f: (
          <SpeciesPhoto
            src={foxExists ? base + "species/fox.jpg" : null}
            letter="A"
          />
        ),
        species_pm: (
          <SpeciesPhoto
            src={pmExists ? base + "species/pm.jpg" : null}
            letter="B"
          />
        ),
      }
    : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-3 py-6 md:gap-8 md:px-4 md:py-12">
      {!isThanks && !isFirst && (
        <ProgressBar
          current={wiz.currentIndex}
          total={wiz.totalSteps}
          label={page.title}
        />
      )}

      <section className="survey-card p-4 md:p-10">
        {wiz.currentStepId === "welcome" ? (
          <WelcomePage
            consented={wiz.state.answers.__consent === true}
            onConsentChange={(v) => wiz.setAnswer("__consent", v as never)}
            onStart={wiz.advance}
          />
        ) : isThanks ? (
          <ThankYouPage submissionId={wiz.state.submissionId} />
        ) : (
          <div className="space-y-8">
            <header className="space-y-2">
              <h1 className="!font-serif !text-2xl md:!text-3xl">{page.title}</h1>
              {page.intro && (
                <p className="max-w-prose text-stone-700">{page.intro}</p>
              )}
            </header>

            <PageRenderer
              page={page}
              answers={wiz.state.answers as Record<string, never>}
              onChange={(id, v) => wiz.setAnswer(id, v)}
              inlineBefore={introInlineBefore}
            />

            <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-6">
              <Button variant="secondary" size="lg" onClick={wiz.goBack} disabled={isFirst}>
                Back
              </Button>
              {isDemographics ? (
                <div className="flex flex-col items-end gap-2">
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!wiz.canProceed || submitStatus === "submitting"}
                  >
                    {submitStatus === "submitting" ? "Submitting…" : "Submit survey"}
                  </Button>
                  {submitStatus === "error" && (
                    <p className="text-sm text-red-700">
                      Couldn't submit: {submitError}.{" "}
                      <button type="button" className="underline" onClick={handleSubmit}>
                        Try again
                      </button>
                    </p>
                  )}
                </div>
              ) : (
                <Button size="lg" onClick={wiz.advance} disabled={!wiz.canProceed}>
                  Next
                </Button>
              )}
            </nav>
          </div>
        )}
      </section>

      {!isThanks && (
        <footer className="text-center text-xs text-stone-500">
          Ulster University · School of Geography and Environmental Sciences · Research survey
        </footer>
      )}
    </main>
  );
}

function SpeciesPhoto({ src, letter }: { src: string | null; letter: "A" | "B" }) {
  return (
    <figure className="mb-4">
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100 aspect-[4/3] max-w-md mx-auto">
        {src ? (
          <img
            src={src}
            alt={`Photo ${letter}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-stone-500">
            Photo {letter} placeholder — image file not yet provided.
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-center text-xs uppercase tracking-wide text-stone-500">
        Photo {letter}
      </figcaption>
    </figure>
  );
}
