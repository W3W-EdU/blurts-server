/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use client";

import { Session } from "next-auth";
import styles from "./View.module.scss";
import { Toolbar } from "../../../../../components/client/toolbar/Toolbar";
import { DashboardTopBanner } from "./DashboardTopBanner";
import { useL10n } from "../../../../../hooks/l10n";
import type { UserBreaches } from "../../../../../functions/server/getUserBreaches";
import {
  ExposureCard,
  isScanResult,
} from "../../../../../components/client/ExposureCard";
import {
  ExposuresFilter,
  FilterState,
} from "../../../../../components/client/ExposuresFilter";
import { useState } from "react";
import { ScanResult } from "../../../../../functions/server/onerep";
import { HibpLikeDbBreach } from "../../../../../../utils/hibp";
import { BundledVerifiedEmails } from "../../../../../../utils/breaches";

export type Props = {
  user: Session["user"];
  userBreaches: UserBreaches;
  isUserScannedResults: boolean;
  userScannedResults: ScanResult[];
  chartData: Record<string, number>[];
  locale: string;
};

export const View = (props: Props) => {
  const l10n = useL10n();
  const totalBreaches = props.userBreaches.breachesData.verifiedEmails.reduce(
    (count, emailData) => count + emailData.breaches.length,
    0
  );

  const dateObject = (isoString: string): Date => {
    return new Date(isoString);
  };

  const initialFilterState: FilterState = {
    exposureType: "",
    dateFound: "",
    status: "",
  };

  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Only breaches exposure cards
  const breachExposureCards = props.userBreaches.breachesData.verifiedEmails
    .map((verifiedEmail) => {
      const breachCardsForThisEmail = verifiedEmail.breaches.map((breach) => {
        return (
          <li
            key={`${verifiedEmail.email}_${breach.Id.toString()}`}
            className={styles.exposureListItem}
          >
            <ExposureCard
              exposureData={breach}
              exposureName={breach.Name}
              fromEmail={verifiedEmail.email}
              exposureDetailsLink={""} //TODO: Find out what link to add in a breach card
              dateFound={breach.AddedDate}
              statusPillType="needAction"
              locale={props.locale}
              color={getRandomLightNebulaColor(breach.Name)}
            />
          </li>
        );
      });
      // Technically a JSX.Element can be `any`, but we know it's not.
      // (At least, I *think* that's why this rule triggers.)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return breachCardsForThisEmail;
    })
    .flat();

  const breachesDataArray = props.userBreaches.breachesData.verifiedEmails.map(
    (elem: BundledVerifiedEmails) => elem.breaches
  );
  const scannedResultsDataArray =
    props.userScannedResults.map((elem: ScanResult) => elem) || [];

  // Merge exposure cards
  const combinedArray = [
    ...breachesDataArray.flat(),
    ...scannedResultsDataArray,
  ];

  // Sort in descending order
  const arraySortedByDate = combinedArray.sort((a, b) => {
    const dateA =
      (a as HibpLikeDbBreach).AddedDate || (a as ScanResult).created_at;
    const dateB =
      (b as HibpLikeDbBreach).AddedDate || (b as ScanResult).created_at;

    const timestampA =
      typeof dateA === "object" ? dateA.getTime() : new Date(dateA).getTime();
    const timestampB =
      typeof dateB === "object" ? dateB.getTime() : new Date(dateB).getTime();

    return timestampB - timestampA;
  });

  const filteredExposures = arraySortedByDate.filter(
    (exposure: ScanResult | HibpLikeDbBreach) => {
      const getExposureType = isScanResult(exposure)
        ? "data-broker"
        : "data-breach";

      // Filter by exposure type
      if (
        filters.exposureType &&
        filters.exposureType !== getExposureType &&
        filters.exposureType !== "show-all-exposure-type"
      ) {
        return false;
      }

      // Filter by date
      if (filters.dateFound && filters.dateFound !== "show-all-date-found") {
        const currentDate = new Date();
        const exposureDate = isScanResult(exposure)
          ? new Date(exposure.created_at)
          : exposure.AddedDate;

        if (filters.dateFound === "seven-days") {
          const sevenDaysAgo = new Date(
            currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          if (exposureDate < sevenDaysAgo) {
            return false;
          }
        } else if (filters.dateFound === "thirty-days") {
          const thirtyDaysAgo = new Date(
            currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
          );
          if (exposureDate < thirtyDaysAgo) {
            return false;
          }
        } else if (filters.dateFound === "last-year") {
          const oneYearAgo = new Date(
            currentDate.getTime() - 365 * 24 * 60 * 60 * 1000
          );
          if (exposureDate < oneYearAgo) {
            return false;
          }
        }
      }
      // TODO: Filter by status
      return true;
    }
  );

  const exposureCardElems = filteredExposures.map(
    (exposure: ScanResult | HibpLikeDbBreach, index) => {
      let email;
      // Get the email assosciated with breach
      if (!isScanResult(exposure)) {
        props.userBreaches.breachesData.verifiedEmails.forEach(
          (verifiedEmail) => {
            if (
              verifiedEmail.breaches.some((breach) => breach.Id === exposure.Id)
            ) {
              email = verifiedEmail.email;
            }
          }
        );
      }
      return isScanResult(exposure) ? (
        // Scanned result
        <li
          key={`scan-${exposure.id}-${index}`}
          className={styles.exposureListItem}
        >
          <ExposureCard
            exposureData={exposure}
            exposureName={exposure.data_broker}
            exposureDetailsLink={exposure.link}
            dateFound={dateObject(exposure.created_at)}
            statusPillType="needAction"
            locale={props.locale}
            color={getRandomLightNebulaColor(exposure.data_broker)}
          />
        </li>
      ) : (
        // Breaches result
        <li
          key={`breach-${exposure.Id}-${index}`}
          className={styles.exposureListItem}
        >
          <ExposureCard
            exposureData={exposure}
            exposureName={exposure.Title}
            fromEmail={email}
            exposureDetailsLink=""
            dateFound={exposure.AddedDate}
            statusPillType="needAction"
            locale={props.locale}
            color={getRandomLightNebulaColor(exposure.Name)}
          />
        </li>
      );
    }
  );

  return (
    <div className={styles.wrapper}>
      <Toolbar user={props.user}>
        TODO:{" "}
        <a href="https://react-spectrum.adobe.com/react-aria/useTabList.html">
          add a tab list
        </a>
      </Toolbar>
      <div className={styles.dashboardContent}>
        <DashboardTopBanner
          chartData={props.chartData}
          type={"LetsFixDataContent"}
          chart={<></>}
        />
        <section className={styles.exposuresArea}>
          <h2 className={styles.exposuresAreaHeadline}>
            {l10n.getString("dashboard-exposures-area-headline")}
          </h2>
          <p className={styles.exposuresAreaDescription}>
            {l10n.getString("dashboard-exposures-area-description", {
              // TODO: Use real user data
              exposures_total_num: 1337,
              data_breach_total_num: totalBreaches,
              data_broker_total_num: 1337,
            })}
          </p>
          <div className={styles.exposuresFilterWrapper}>
            <ExposuresFilter setFilterValues={setFilters} />
          </div>
          <ul className={styles.exposureList}>
            {props.isUserScannedResults
              ? exposureCardElems
              : breachExposureCards}
          </ul>
        </section>
      </div>
    </div>
  );
};

// Same logic as breachLogo.js
function getRandomLightNebulaColor(name: string) {
  const colors = [
    "#C689FF",
    "#D9BFFF",
    "#AB71FF",
    "#E7DFFF",
    "#AB71FF",
    "#3FE1B0",
    "#54FFBD",
    "#88FFD1",
    "#B3FFE3",
    "#D1FFEE",
    "#F770FF",
    "#F68FFF",
    "#F6B8FF",
    "#00B3F4",
    "#00DDFF",
    "#80EBFF",
    "#FF8450",
    "#FFA266",
    "#FFB587",
    "#FFD5B2",
    "#FF848B",
    "#FF9AA2",
    "#FFBDC5",
    "#FF8AC5",
    "#FFB4DB",
  ];

  const charValues = name.split("").map((letter) => letter.codePointAt(0));

  const charSum = charValues.reduce((sum: number | undefined, codePoint) => {
    if (codePoint === undefined) return sum;
    if (sum === undefined) return codePoint;
    return sum + codePoint;
  }, undefined);

  if (charSum === undefined) {
    return colors[0];
  }

  const colorIndex = charSum % colors.length;
  return colors[colorIndex];
}