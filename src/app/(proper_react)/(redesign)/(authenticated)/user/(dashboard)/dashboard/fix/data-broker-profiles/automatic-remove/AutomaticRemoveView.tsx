/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use client";

import React, { ComponentProps, useState } from "react";
import styles from "../dataBrokerProfiles.module.scss";
import { Button } from "../../../../../../../../../components/client/Button";
import { useL10n } from "../../../../../../../../../hooks/l10n";
import { FixView } from "../../FixView";
import { CONST_ONEREP_DATA_BROKER_COUNT } from "../../../../../../../../../../constants";

export type Props = Omit<ComponentProps<typeof FixView>, "children"> & {
  monthlySubscriptionUrl: string;
  yearlySubscriptionUrl: string;
};

export function AutomaticRemoveView(props: Props) {
  const l10n = useL10n();

  const [selectedPlanIsYearly, setSelectedPlanIsYearly] = useState(true);

  const dataBrokerCount = CONST_ONEREP_DATA_BROKER_COUNT;

  const { monthlySubscriptionUrl, yearlySubscriptionUrl, ...fixViewProps } =
    props;

  // format subscription urls
  const monthlyUrl = new URL(monthlySubscriptionUrl);
  const yearlyUrl = new URL(yearlySubscriptionUrl);
  const monthlyParams = monthlyUrl.searchParams;
  const yearlyParams = yearlyUrl.searchParams;
  // overwrite the three params below
  monthlyParams.set(
    "entrypoint",
    "monitor.mozilla.org-monitor-in-product-guided-upsell",
  );
  yearlyParams.set(
    "entrypoint",
    "monitor.mozilla.org-monitor-in-product-guided-upsell",
  );
  monthlyParams.set("form_type", "button");
  yearlyParams.set("form_type", "button");

  // placeholder utms if acquisition source is unknown
  if (!monthlyParams.has("utm_source")) {
    monthlyParams.append("utm_source", "product");
  }
  if (!monthlyParams.has("utm_medium")) {
    monthlyParams.append("utm_medium", "monitor");
  }
  if (!monthlyParams.has("utm_campaign")) {
    monthlyParams.append("utm_campaign", "guided-upsell");
  }
  if (!yearlyParams.has("utm_source")) {
    yearlyParams.append("utm_source", "product");
  }
  if (!yearlyParams.has("utm_medium")) {
    yearlyParams.append("utm_medium", "monitor");
  }
  if (!yearlyParams.has("utm_campaign")) {
    yearlyParams.append("utm_campaign", "guided-upsell");
  }
  monthlySubscriptionUrl = `${monthlyUrl.pathname}?${monthlyParams.toString()}`;
  yearlySubscriptionUrl = `${yearlyUrl.pathname}?${yearlyParams.toString()}`;

  return (
    <FixView {...fixViewProps} hideProgressIndicator>
      <div>
        <div className={`${styles.content} ${styles.contentAutomaticRemove}`}>
          <h3>
            {l10n.getString(
              "fix-flow-data-broker-profiles-automatic-remove-headline",
            )}
          </h3>
          <p>
            {l10n.getString(
              "fix-flow-data-broker-profiles-automatic-remove-subheadline",
              {
                data_broker_count: dataBrokerCount,
              },
            )}
          </p>
        </div>
        <div className={styles.content}>
          <div className={styles.upgradeToggleWrapper}>
            <div className={styles.upgradeToggle}>
              <button
                onClick={() => setSelectedPlanIsYearly(!selectedPlanIsYearly)}
                className={`${selectedPlanIsYearly ? styles.isActive : ""}`}
              >
                {l10n.getString(
                  "fix-flow-data-broker-profiles-automatic-remove-features-select-plan-toggle-yearly",
                )}
              </button>
              <button
                onClick={() => setSelectedPlanIsYearly(!selectedPlanIsYearly)}
                className={`${selectedPlanIsYearly ? "" : styles.isActive}`}
              >
                {l10n.getString(
                  "fix-flow-data-broker-profiles-automatic-remove-features-select-plan-toggle-monthly",
                )}
              </button>
            </div>
            <span>
              {l10n.getString(
                "fix-flow-data-broker-profiles-automatic-remove-save-percent",
                { percent: 10 },
              )}
            </span>
          </div>
          <div className={styles.upgradeContentWrapper}>
            {/* Feature List */}
            <div className={styles.featuresList}>
              <strong>
                {l10n.getString(
                  "fix-flow-data-broker-profiles-automatic-remove-features-headline",
                )}
              </strong>
              <ul>
                <li>
                  {l10n.getString(
                    "fix-flow-data-broker-profiles-automatic-remove-features-monthly-scan",
                    {
                      data_broker_count: dataBrokerCount,
                    },
                  )}
                </li>
                <li>
                  {l10n.getString(
                    "fix-flow-data-broker-profiles-automatic-remove-features-remove-personal-info",
                  )}
                </li>
                <li>
                  {l10n.getString(
                    "fix-flow-data-broker-profiles-automatic-remove-features-guided-experience",
                  )}
                </li>
                <li>
                  {l10n.getString(
                    "fix-flow-data-broker-profiles-automatic-remove-features-continuous-monitoring",
                  )}
                </li>
                <li>
                  {l10n.getString(
                    "fix-flow-data-broker-profiles-automatic-remove-features-breach-alerts",
                  )}
                </li>
              </ul>
            </div>
            {/* Plan select */}
            <div className={styles.selectedPlan}>
              <strong>
                {l10n.getString(
                  "fix-flow-data-broker-profiles-automatic-remove-features-select-plan-headline",
                )}
                <small>
                  {selectedPlanIsYearly
                    ? l10n.getString(
                        "fix-flow-data-broker-profiles-automatic-remove-features-select-plan-yearly-frequency",
                      )
                    : l10n.getString(
                        "fix-flow-data-broker-profiles-automatic-remove-features-select-plan-monthly-frequency",
                      )}
                </small>
              </strong>
              {/* Price */}
              <span>
                {selectedPlanIsYearly
                  ? l10n.getString(
                      "fix-flow-data-broker-profiles-automatic-remove-features-price",
                      { price: "X.XX" },
                    )
                  : l10n.getString(
                      "fix-flow-data-broker-profiles-automatic-remove-features-price",
                      { price: "X.XX" },
                    )}
              </span>
              <Button
                variant="primary"
                href={
                  selectedPlanIsYearly
                    ? yearlySubscriptionUrl
                    : monthlySubscriptionUrl
                }
              >
                {selectedPlanIsYearly
                  ? l10n.getString(
                      "fix-flow-data-broker-profiles-automatic-remove-features-select-plan-yearly-button",
                    )
                  : l10n.getString(
                      "fix-flow-data-broker-profiles-automatic-remove-features-select-plan-monthly-button",
                    )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FixView>
  );
}
