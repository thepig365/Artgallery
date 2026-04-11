import { gaEvent } from "./gtag";

type Extra = Record<string, string | number | boolean | undefined>;

/** First meaningful engagement with a tracked form (GA4 custom event). */
export function trackFormStart(formName: string, extra?: Extra): void {
  gaEvent("form_start", { form_name: formName, ...extra });
}

/** Successful server-backed submit for generic enquiry/takedown flows. */
export function trackFormSubmit(formName: string, extra?: Extra): void {
  gaEvent("form_submit", { form_name: formName, ...extra });
}

/** Artist intake wizard — first interaction (focus within wizard). */
export function trackArtistSubmissionStart(): void {
  gaEvent("artist_submission_start", {});
}

/** Artist intake — API accepted submission. */
export function trackArtistSubmissionComplete(referenceId: string | null): void {
  gaEvent("artist_submission_complete", {
    reference_id: referenceId ?? "",
  });
}

/** Private viewing request form — successful POST to /api/enquiry. */
export function trackPrivateViewingRequest(): void {
  gaEvent("private_viewing_request", {});
}
