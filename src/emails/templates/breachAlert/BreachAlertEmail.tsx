/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import type { SubscriberRow } from "knex/types/tables";
import { ExtendedReactLocalization } from "../../../app/functions/l10n";
import { EmailFooter, RedesignedBreachEmailFooter } from "../EmailFooter";
import { EmailHeader } from "../EmailHeader";
import { HibpLikeDbBreach } from "../../../utils/hibp";
import { BreachCard } from "../../components/BreachCard";
import { FeatureFlagName } from "../../../db/tables/featureFlags";
import { EmailHero } from "../EmailHero";
import { getLocale } from "../../../app/functions/universal/getLocale";
import { isEligibleForPremium } from "../../../app/functions/universal/premium";
import { hasPremium } from "../../../app/functions/universal/user";
import { getSignupLocaleCountry } from "../../functions/getSignupLocaleCountry";
import { getPremiumSubscriptionUrl } from "../../../app/functions/server/getPremiumSubscriptionInfo";
import { DashboardSummary } from "../../../app/functions/server/dashboard";
import { ResolutionRelevantBreachDataTypes } from "../../../app/functions/universal/breach";

export type Props = {
  l10n: ExtendedReactLocalization;
  breach: HibpLikeDbBreach;
  breachedEmail: string;
  utmCampaignId: string;
  subscriber: SubscriberRow;
};

export const BreachAlertEmail = (props: Props) => {
  const l10n = props.l10n;

  return (
    <mjml>
      <mj-head>
        <mj-preview>{l10n.getString("email-spotted-new-breach")}</mj-preview>
      </mj-head>
      <mj-body>
        <EmailHeader l10n={l10n} utm_campaign={props.utmCampaignId} />
        <mj-section padding="20px">
          <mj-column>
            <mj-text align="center" font-size="16px" line-height="24px">
              {l10n.getFragment("email-breach-detected-2", {
                vars: { "email-address": props.breachedEmail },
                elems: { b: <b /> },
              })}
            </mj-text>
          </mj-column>
        </mj-section>
        <BreachCard breach={props.breach} l10n={l10n} />
        <mj-section padding="20px">
          <mj-column>
            <mj-button
              href={`${process.env.SERVER_URL}/user/dashboard/action-needed?utm_source=monitor-product&utm_medium=email&utm_campaign=${props.utmCampaignId}&utm_content=view-your-dashboard-us`}
              background-color="#0060DF"
              font-weight={600}
              font-size="15px"
              line-height="22px"
            >
              {l10n.getString("email-dashboard-cta")}
            </mj-button>
          </mj-column>
        </mj-section>
        <EmailFooter l10n={l10n} utm_campaign={props.utmCampaignId} />
      </mj-body>
    </mjml>
  );
};

export type RedesignedBreachAlertEmailProps = {
  l10n: ExtendedReactLocalization;
  breach: HibpLikeDbBreach;
  breachedEmail: string;
  utmCampaignId: string;
  subscriber: SubscriberRow;
  /**
   * We need to run a bunch of queries to collect this data,
   * so it's optional; however, make sure to pass it in for
   * free users who are eligible for Plus (i.e. in the US),
   * who have run a scan — those are the ones we show a
   * <DataPointCount> for at the moment. We also use the
   * presence of this property to determine whether free
   * US users have run a scan. If, in the future, we assume
   * we can do the same for Plus users, that might break, but
   * that's a risk we'll have to take for now:
   */
  dataSummary?: DashboardSummary;
  enabledFeatureFlags: FeatureFlagName[];
};

// These components are fully covered by the BreachAlertEmail test,
// but for some reason get marked as uncovered again once the
// `src/scripts/cronjobs/emailBreachAlerts.test.ts` tests are run:
/* c8 ignore start */
export const RedesignedBreachAlertEmail = (
  props: RedesignedBreachAlertEmailProps,
) => {
  if (!props.enabledFeatureFlags.includes("BreachEmailRedesign")) {
    return <BreachAlertEmail {...props} />;
  }

  const l10n = props.l10n;
  const locale = getLocale(props.l10n);
  const listFormatter = new Intl.ListFormat(locale);

  const assumedCountryCode = getSignupLocaleCountry(props.subscriber);
  const utmContentSuffix = isEligibleForPremium(assumedCountryCode)
    ? "-us"
    : "-global";
  let utmCampaignId = "breach-alert-global";
  if (isEligibleForPremium(assumedCountryCode)) {
    if (hasPremium(props.subscriber)) {
      utmCampaignId = "breach-alert-plus";
    } else {
      if (typeof props.dataSummary === "undefined") {
        utmCampaignId = "breach-alert-free-us-no-scan";
      } else {
        utmCampaignId = "breach-alert-free-us-scanned";
      }
    }
  }

  const premiumSubscriptionUrlObject = new URL(
    getPremiumSubscriptionUrl({ type: "yearly" }),
  );
  premiumSubscriptionUrlObject.searchParams.set("utm_medium", "email");
  premiumSubscriptionUrlObject.searchParams.set(
    "utm_source",
    "monitor-product",
  );
  premiumSubscriptionUrlObject.searchParams.set("utm_campaign", utmCampaignId);
  premiumSubscriptionUrlObject.searchParams.set(
    "utm_content",
    `get-monitor-plus${utmContentSuffix}`,
  );

  return (
    <mjml>
      <mj-head>
        <mj-preview>
          {l10n.getString("email-breach-alert-all-preview")}
        </mj-preview>
        <mj-style>
          {`
            dt {
              font-weight: bold;
              display: inline-block;
              padding-right: 4px;
              padding-inline-end: 4px;
            }
            dd {
              display: inline;
            }
          `}
        </mj-style>
      </mj-head>
      <mj-body>
        <EmailHero
          l10n={l10n}
          utm_campaign={utmCampaignId}
          utmContentSuffix={utmContentSuffix}
          heading={l10n.getString("email-breach-alert-all-hero-heading")}
          subheading={l10n.getString("email-breach-alert-all-hero-subheading")}
        />
        <mj-section padding="24px 52px 12px">
          <mj-column>
            <mj-text font-size="16px" line-height="24px">
              <p>{l10n.getString("email-breach-alert-all-lead")}</p>
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section padding="16px 52px">
          <mj-column>
            <mj-text font-size="16px" line-height="24px">
              <dl>
                <div>
                  <dt>
                    {l10n.getString("email-breach-alert-all-source-title")}
                  </dt>
                  <dd>{props.breach.Title}</dd>
                </div>
                <div>
                  <dt>
                    {l10n.getString("email-breach-alert-all-data-points-title")}
                  </dt>
                  <dd>
                    {listFormatter.format(
                      (props.breach.DataClasses ?? [])
                        .filter((datatype) =>
                          (
                            Object.values(
                              ResolutionRelevantBreachDataTypes,
                            ) as string[]
                          ).includes(datatype),
                        )
                        .map((classKey) => props.l10n.getString(classKey)),
                    )}
                  </dd>
                </div>
              </dl>
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section padding="12px 52px">
          <mj-column>
            <mj-text font-size="16px" line-height="24px">
              <p>{l10n.getString("email-breach-alert-all-next-steps-lead")}</p>
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section padding="12px 0 24px 52px" text-align="left">
          <mj-column padding="0" padding-left="24px" width="250px">
            <mj-button
              href={`${process.env.SERVER_URL}/user/dashboard/action-needed/?utm_source=monitor-product&utm_medium=email&utm_campaign=${utmCampaignId}&utm_content=lets-get-started${utmContentSuffix}`}
              background-color="#0060DF"
              border="2px solid #0060DF"
              font-weight={600}
              padding="0"
              border-radius="8px"
              font-size="16px"
              line-height="24px"
              align="left"
              width="240px"
            >
              {l10n.getString("email-breach-alert-all-next-steps-cta-label")}
            </mj-button>
          </mj-column>
          {
            // Don't show the "Go to Dashboard" button if the user is in the US,
            // and does not have Plus yet; those users already get quite a few
            // buttons, so we leave this one out so as not to overwhelm them:
            (!isEligibleForPremium(assumedCountryCode) ||
              hasPremium(props.subscriber)) && (
              <mj-column padding="0" padding-left="24px" width="250px">
                <mj-button
                  href={`${process.env.SERVER_URL}/user/dashboard/?utm_source=monitor-product&utm_medium=email&utm_campaign=${utmCampaignId}&utm_content=dashboard${utmContentSuffix}`}
                  background-color="white"
                  border="2px solid #0060DF"
                  color="#0060DF"
                  font-weight={600}
                  padding="0"
                  border-radius="8px"
                  font-size="16px"
                  line-height="24px"
                  align="left"
                  width="240px"
                >
                  {l10n.getString(
                    "email-breach-alert-all-next-steps-button-dashboard",
                  )}
                </mj-button>
              </mj-column>
            )
          }
        </mj-section>
        <DataPointCount
          {...props}
          utmCampaignId={utmCampaignId}
          utmContentSuffix={utmContentSuffix}
        />
        {isEligibleForPremium(assumedCountryCode) &&
          !hasPremium(props.subscriber) &&
          (typeof props.dataSummary === "undefined" ? (
            <Banner
              heading={l10n.getString(
                "email-breach-alert-plus-scan-banner-heading",
              )}
              content={l10n.getString(
                "email-breach-alert-plus-scan-banner-content",
              )}
              ctaLabel={l10n.getString(
                "email-breach-alert-plus-scan-banner-cta-label",
              )}
              ctaTarget={`${process.env.SERVER_URL}/user/dashboard/?utm_source=monitor-product&utm_medium=email&utm_campaign=${utmCampaignId}&utm_content=take-action${utmContentSuffix}`}
            />
          ) : (
            <Banner
              heading={l10n.getString(
                "email-breach-alert-plus-upgrade-banner-heading",
              )}
              content={l10n.getString(
                "email-breach-alert-plus-upgrade-banner-content",
              )}
              ctaLabel={l10n.getString(
                "email-breach-alert-plus-upgrade-banner-cta-label",
              )}
              ctaTarget={premiumSubscriptionUrlObject.href}
            />
          ))}
        <RedesignedBreachEmailFooter l10n={l10n} utm_campaign={utmCampaignId} />
      </mj-body>
    </mjml>
  );
};

const Banner = (props: {
  heading: string;
  content: string;
  ctaLabel: string;
  ctaTarget: string;
}) => {
  return (
    <mj-wrapper padding="24px 16px">
      <mj-section padding="24px" background-color="#7542E5" border-radius="8px">
        <mj-column vertical-align="middle" padding="0">
          <mj-text
            font-size="16px"
            line-height="24px"
            padding="0"
            color="white"
          >
            <h3>{props.heading}</h3>
            <p>{props.content}</p>
          </mj-text>
        </mj-column>
        <mj-column vertical-align="middle" padding="0" width="230px">
          <mj-button
            href={props.ctaTarget}
            background-color="transparent"
            font-weight={600}
            font-size="15px"
            line-height="22px"
            border-radius="8px"
            border="2px solid white"
            color="white"
            padding="0"
          >
            {props.ctaLabel}
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-wrapper>
  );
};

const DataPointCount = (
  props: RedesignedBreachAlertEmailProps & { utmContentSuffix: string },
) => {
  if (typeof props.dataSummary === "undefined") {
    return null;
  }
  if (hasPremium(props.subscriber)) {
    // Plus subscribers don't need to take action on scans,
    // so don't show the callout there:
    return null;
  }

  const l10n = props.l10n;
  const sumOfUnresolvedDataPoints =
    props.dataSummary.unresolvedSanitizedDataPoints.reduce(
      (total, dataPointSummary) => {
        return total + Object.values(dataPointSummary)[0];
      },
      0,
    );

  return (
    <mj-wrapper padding="24px 16px">
      <mj-section
        padding="24px 52px 16px"
        background-color="#F9F9FA"
        border-radius="16px 16px 0 0"
      >
        <mj-column>
          <mj-text
            font-size="24px"
            line-height="24px"
            padding="0"
            align="center"
            font-weight={500}
          >
            <h3>
              {l10n.getString("email-breach-alert-plus-scan-results-heading")}
            </h3>
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section padding="24px 52px" background-color="#F9F9FA">
        <mj-column
          background-color="#E7DFFF"
          border-radius="16px"
          padding="16px 24px"
        >
          <mj-text align="center" font-size="14px" line-height="21px">
            <p>
              {l10n.getFragment(
                "email-breach-alert-plus-scan-results-data-points-label",
                {
                  elems: {
                    stat: (
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "60px",
                          lineHeight: "68px",
                        }}
                      />
                    ),
                  },
                  vars: { data_point_count: sumOfUnresolvedDataPoints },
                },
              )}
            </p>
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section
        padding="16px 52px 24px"
        background-color="#F9F9FA"
        border-radius="0 0 16px 16px"
      >
        <mj-column>
          <mj-button
            href={`${process.env.SERVER_URL}/user/dashboard/action-needed?utm_source=monitor-product&utm_medium=email&utm_campaign=${props.utmCampaignId}&utm_content=take-action${props.utmContentSuffix}`}
            background-color="#0060DF"
            border-radius="8px"
            padding="12px 24px"
            font-weight={600}
            font-size="15px"
            line-height="22px"
            width="100%"
          >
            {l10n.getString("email-breach-alert-plus-scan-results-cta-label")}
          </mj-button>
          <mj-text
            font-size="12px"
            line-height="24px"
            padding="0"
            align="center"
            font-weight={400}
            font-style="italic"
            color="#6D6D6E"
          >
            <p>
              {l10n.getString("email-breach-alert-plus-scan-results-trailer")}
            </p>
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-wrapper>
  );
};
/* c8 ignore stop */
