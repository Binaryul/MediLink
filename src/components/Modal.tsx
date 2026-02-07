import type { ReactNode } from "react";

interface ModalProps {
  overlayClassName?: string;
  modalClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
  bodyClassName?: string;
  title: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  headerActions?: ReactNode;
  children: ReactNode;
}

function Modal({
  overlayClassName,
  modalClassName,
  headerClassName,
  titleClassName,
  closeButtonClassName,
  bodyClassName,
  title,
  onClose,
  showCloseButton = true,
  headerActions,
  children,
}: ModalProps) {
  return (
    <div className={overlayClassName} role="dialog" aria-modal="true">
      <div className={modalClassName}>
        <div className={headerClassName}>
          <h2 className={titleClassName}>{title}</h2>
          {headerActions}
          {showCloseButton && onClose ? (
            <button
              className={closeButtonClassName}
              type="button"
              onClick={onClose}
            >
              Close
            </button>
          ) : null}
        </div>
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
