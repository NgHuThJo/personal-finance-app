import * as FormPrimitive from "@radix-ui/react-form";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import styles from "./form.module.css";
import { cn } from "#frontend/shared/utils/cn";

const formFieldVariants = cva("", {
  variants: {
    variant: {
      default: styles["form-field"],
      group: styles["form-group"],
      checkbox: styles["form-checkbox-group"],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Form({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Root>) {
  return (
    <FormPrimitive.Root
      className={cn(styles["form-root"], className)}
      data-slot="form"
      {...props}
    />
  );
}

function FormField({
  className,
  variant,
  name,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Field> &
  VariantProps<typeof formFieldVariants>) {
  return (
    <FormPrimitive.Field
      className={cn(formFieldVariants({ variant, className }))}
      data-slot="form-field"
      name={name}
      {...props}
    />
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Label>) {
  return (
    <FormPrimitive.Label
      className={cn(styles["form-label"], className)}
      data-slot="form-label"
      {...props}
    />
  );
}

function FormControl({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Control>) {
  return (
    <FormPrimitive.Control
      className={cn(styles["form-control"], className)}
      data-slot="form-control"
      {...props}
    />
  );
}

function FormMessage({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Message>) {
  return (
    <FormPrimitive.Message
      className={cn(styles["form-message"], className)}
      data-slot="form-message"
      {...props}
    />
  );
}

function FormSubmit({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Submit>) {
  return (
    <FormPrimitive.Submit
      className={cn(styles["form-submit"], className)}
      data-slot="form-submit"
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="form-label"
      className={cn(styles["form-label"], className)}
      {...props}
    />
  );
}

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormSubmit,
  Label,
};
