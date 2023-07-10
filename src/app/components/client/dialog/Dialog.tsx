/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactNode, useRef } from "react";
import { AriaDialogProps, useButton, useDialog } from "react-aria";
import styles from "./Dialog.module.scss";
import { CloseBtn } from "../../server/Icons";
import { useL10n } from "../../../hooks/l10n";

type ContentAlignment = "left" | "center" | "right";

export type Props = {
  children: ReactNode;
  onDismiss?: () => void;
  title?: ReactNode;
  illustration?: ReactNode;
  contentAlignment?: ContentAlignment;
} & AriaDialogProps;

export const Dialog = ({
  children,
  contentAlignment = "center",
  onDismiss,
  title,
  illustration,
  ...otherProps
}: Props) => {
  const l10n = useL10n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { dialogProps, titleProps } = useDialog(otherProps, dialogRef);

  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const dismissButtonProps = useButton(
    { onPress: onDismiss },
    dismissButtonRef
  ).buttonProps;
  const dismissButton =
    typeof onDismiss === "function" ? (
      <button
        {...dismissButtonProps}
        ref={dismissButtonRef}
        className={styles.dismissButton}
        onClick={() => onDismiss()}
      >
        <CloseBtn
          alt={l10n.getString("modal-close-alt")}
          width="14"
          height="14"
        />
      </button>
    ) : null;

  return (
    <div
      {...dialogProps}
      ref={dialogRef}
      className={`${styles.dialog} ${styles[contentAlignment]}`}
    >
      {dismissButton}
      {illustration && (
        <div className={styles.illustrationWrapper}>{illustration}</div>
      )}
      {title && (
        <h3 {...titleProps} className={styles.title}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
