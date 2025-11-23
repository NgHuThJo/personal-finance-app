import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import * as React from "react";
import styles from "./dialog.module.css";
import { cn } from "#frontend/shared/utils/cn";

const dialogTitleVariants = cva(styles["dialog-title"], {
  variants: {
    variant: {
      default: "",
      destructive: styles["destructive-dialog-title"],
      sidebar: styles["sidebar-dialog-title"],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const dialogContentVariants = cva("", {
  variants: {
    variant: {
      default: styles["dialog-content"],
      sidebar: styles["dialog-sidebar"],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const dialogCloseVariants = cva("", {
  variants: {
    variant: {
      default: styles["dialog-close"],
      cancel: "",
      group: styles["dialog-close-group"],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const dialogHeaderVariants = cva(styles["dialog-header"], {
  variants: {
    variant: {
      default: "",
      row: styles["dialog-header-row"],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> &
  VariantProps<typeof dialogCloseVariants>) {
  return (
    <DialogPrimitive.Close
      className={cn(dialogCloseVariants({ variant, className }))}
      data-slot="dialog-close"
      {...props}
    />
  );
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(styles["dialog-overlay"], className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  variant,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
} & VariantProps<typeof dialogContentVariants>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={dialogContentVariants({ variant, className })}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(styles["dialog-close"], className)}
            data-slot="dialog-close"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof dialogHeaderVariants>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(dialogHeaderVariants({ variant, className }))}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(styles["dialog-footer"], className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> &
  VariantProps<typeof dialogTitleVariants>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(dialogTitleVariants({ variant, className }))}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(styles["dialog-description"], className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
