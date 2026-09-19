import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { dashboardService } from "@/services/dashboardService";
import type { SettingsData } from "@/types";

export function SettingsPage() {
  const { status, data, error, retry } = useAsyncData(() =>
    dashboardService.getSettings(),
  );
  const [draft, setDraft] = useState<SettingsData | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  if (status === "loading" || !draft) {
    return (
      <>
        <PageHeader
          kicker="Team Urbana"
          title="Settings"
          support="Organization profile, team, and reporting preferences."
        />
        {status === "error" ? (
          <ErrorState message={error ?? undefined} onRetry={retry} />
        ) : (
          <LoadingState label="Loading settings" />
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader
        kicker="Team Urbana"
        title="Settings"
        support="Organization profile, team, and reporting preferences."
      />
      <section className="panel">
        <h2 className="panel__title">Organization profile</h2>
        <div className="toolbar">
          <label className="field">
            Organization
            <input
              value={draft.organization.name}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  organization: {
                    ...draft.organization,
                    name: event.target.value,
                  },
                })
              }
            />
          </label>
          <label className="field">
            Area
            <input
              value={draft.organization.area}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  organization: {
                    ...draft.organization,
                    area: event.target.value,
                  },
                })
              }
            />
          </label>
          <label className="field">
            Contact email
            <input
              type="email"
              value={draft.organization.contactEmail}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  organization: {
                    ...draft.organization,
                    contactEmail: event.target.value,
                  },
                })
              }
            />
          </label>
        </div>
        <p className="panel__meta" style={{ marginBottom: 0 }}>
          {draft.organization.focus}
        </p>
      </section>
      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2 className="panel__title">Team</h2>
        <div className="card-stack">
          {draft.team.map((member) => (
            <article className="team-card" key={member.id}>
              <h3>{member.name}</h3>
              <p className="panel__meta" style={{ marginBottom: 0 }}>
                {member.role} · {member.email}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2 className="panel__title">Notification preferences</h2>
        <ToggleRow
          title="Weekly digest"
          description="A weekly summary of community responses and developments."
          checked={draft.notifications.weeklyDigest}
          onChange={(weeklyDigest) =>
            setDraft({
              ...draft,
              notifications: { ...draft.notifications, weeklyDigest },
            })
          }
        />
        <ToggleRow
          title="Emerging patterns"
          description="Notify when related concerns cluster across buildings."
          checked={draft.notifications.emergingPatterns}
          onChange={(emergingPatterns) =>
            setDraft({
              ...draft,
              notifications: { ...draft.notifications, emergingPatterns },
            })
          }
        />
        <ToggleRow
          title="New developments"
          description="Notify when a development is added to the Kilimani set."
          checked={draft.notifications.newDevelopments}
          onChange={(newDevelopments) =>
            setDraft({
              ...draft,
              notifications: { ...draft.notifications, newDevelopments },
            })
          }
        />
      </section>
      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2 className="panel__title">Reporting preferences</h2>
        <label className="field" style={{ maxWidth: "16rem" }}>
          Default period
          <select
            value={draft.reporting.defaultPeriod}
            onChange={(event) =>
              setDraft({
                ...draft,
                reporting: {
                  ...draft.reporting,
                  defaultPeriod: event.target.value as "monthly" | "quarterly",
                },
              })
            }
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </label>
        <ToggleRow
          title="Include community map"
          description="Attach the spatial view in generated reports."
          checked={draft.reporting.includeMap}
          onChange={(includeMap) =>
            setDraft({
              ...draft,
              reporting: { ...draft.reporting, includeMap },
            })
          }
        />
        <ToggleRow
          title="Include AI-generated summary"
          description="Labelled as generated from aggregated community feedback."
          checked={draft.reporting.includeAiSummary}
          onChange={(includeAiSummary) =>
            setDraft({
              ...draft,
              reporting: { ...draft.reporting, includeAiSummary },
            })
          }
        />
        <div className="btn-row">
          <button
            type="button"
            className="btn"
            onClick={() => {
              window.localStorage.setItem(
                "jirani.settings",
                JSON.stringify(draft),
              );
              setSaved(true);
            }}
          >
            Save preferences
          </button>
        </div>
        {saved ? (
          <p className="banner" role="status">
            Preferences saved on this device. They are not yet synced to a
            server.
          </p>
        ) : null}
      </section>
    </>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = title.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="switch-row">
      <div>
        <label htmlFor={id}>{title}</label>
        <p>{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  );
}
