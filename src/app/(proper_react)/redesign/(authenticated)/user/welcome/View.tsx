/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Session } from "next-auth";
import styles from "./View.module.scss";
import stepGetStartedIcon from "./images/step-counter-get-started.svg";
import stepEnterInfoIcon from "./images/step-counter-enter-info.svg";
import stepFindExposuresIcon from "./images/step-counter-find-exposures.svg";
import stepDoneIcon from "./images/step-counter-done.svg";
import { GetStarted } from "./GetStarted";
import { FindExposures } from "./FindExposures";
import { EnterInfo } from "./EnterInfo";
import { useL10n } from "../../../../../hooks/l10n";
import monitorLogo from "../../../../images/monitor-logo.webp";

export type Props = {
  user: Session["user"];
  dataBrokerCount: number;
  breachesTotalCount: number;
};

type StepId = "getStarted" | "enterInfo" | "findExposures";

export const View = ({ user, dataBrokerCount, breachesTotalCount }: Props) => {
  const l10n = useL10n();
  const [currentStep, setCurrentStep] = useState<StepId>("getStarted");

  const currentComponent =
    currentStep === "findExposures" ? (
      <FindExposures
        dataBrokerCount={dataBrokerCount}
        breachesTotalCount={breachesTotalCount}
      />
    ) : currentStep === "enterInfo" ? (
      <EnterInfo
        user={user}
        onScanStarted={() => setCurrentStep("findExposures")}
        onGoBack={() => setCurrentStep("getStarted")}
      />
    ) : (
      <GetStarted
        dataBrokerCount={dataBrokerCount}
        onStart={() => setCurrentStep("enterInfo")}
      />
    );

  return (
    <div className={styles.wrapper}>
      <header>
        <Link href="/" className={styles.homeLink}>
          <Image
            src={monitorLogo}
            alt={l10n.getString("main-nav-link-home-label")}
            width={170}
          />
        </Link>
      </header>
      <nav className={styles.stepsWrapper}>
        <Steps currentStep={currentStep} />
      </nav>
      <main className={styles.contentWrapper}>{currentComponent}</main>
    </div>
  );
};

export const Steps = (props: { currentStep: StepId }) => {
  const l10n = useL10n();

  return (
    <ul className={styles.steps}>
      <li
        aria-current={props.currentStep === "getStarted" ? "step" : undefined}
        className={`${styles.getStarted} ${
          isStepDone("getStarted", props.currentStep) ? styles.isCompleted : ""
        }`}
      >
        <Image
          src={
            props.currentStep === "getStarted"
              ? stepGetStartedIcon
              : stepDoneIcon
          }
          alt=""
          width={22}
          height={22}
        />
        <div className={styles.stepLabel}>
          {l10n.getString("onboarding-steps-get-started-label")}
        </div>
      </li>
      <li
        aria-current={props.currentStep === "enterInfo" ? "step" : undefined}
        className={`${styles.enterInfo} ${
          isStepDone("enterInfo", props.currentStep) ? styles.isCompleted : ""
        }`}
      >
        <Image src={stepEnterInfoIcon} alt="" width={22} height={22} />
        <div className={styles.stepLabel}>
          {l10n.getString("onboarding-steps-enter-info-label")}
        </div>
      </li>
      <li
        aria-current={
          props.currentStep === "findExposures" ? "step" : undefined
        }
        className={`${styles.findExposures} ${
          isStepDone("findExposures", props.currentStep)
            ? styles.isCompleted
            : ""
        }`}
      >
        <Image src={stepFindExposuresIcon} alt="" width={22} height={22} />
        <div className={styles.stepLabel}>
          {l10n.getString("onboarding-steps-find-exposures-label")}
        </div>
      </li>
    </ul>
  );
};

function isStepDone(step: StepId, currentStep: StepId): boolean {
  if (step === "getStarted") {
    return currentStep !== "getStarted";
  }
  if (step === "enterInfo") {
    return currentStep === "findExposures";
  }
  return false;
}