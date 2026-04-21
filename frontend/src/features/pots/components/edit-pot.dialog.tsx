import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import styles from "./add-pot-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type {
  EditPotRequest,
  GetAllPotsResponse,
} from "#frontend/shared/client";
import {
  editPotMutation,
  getAllPotsOptions,
  getAllPotsQueryKey,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "#frontend/shared/primitives/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
} from "#frontend/shared/primitives/field";
import { Input } from "#frontend/shared/primitives/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "#frontend/shared/primitives/select";
import { Spinner } from "#frontend/shared/primitives/spinner";
import { colorHexList } from "#frontend/shared/utils/color";

type EditPotDialogProps = {
  potData: GetAllPotsResponse;
  isEditDialogOpen: boolean;
  toggleEditDialog: (shouldOpen: boolean) => void;
};

export function EditPotDialog({
  potData: { id, name, target, themeColor },
  isEditDialogOpen,
  toggleEditDialog,
}: EditPotDialogProps) {
  const queryClient = useQueryClient();
  const {
    register,
    reset,
    setError,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPotRequest>({
    defaultValues: {
      potName: name,
      newTarget: target,
    },
  });
  const { data: potData } = useQuery({
    ...getAllPotsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
    enabled: false,
  });

  const { mutate, isPending } = useMutation({
    ...editPotMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: () => {
      Logger.info("Pot successfully edited");
      queryClient.invalidateQueries({ queryKey: getAllPotsQueryKey() });
      toggleEditDialog(false);
      reset();
      toast.success("Pot successfully edited");
    },
    onError: (error) => {
      Logger.error("Pot could not be edited", error);
      toast.error(error.detail);

      switch (error.status) {
        case 400: {
          setError(`root.server-bad-request`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        case 409: {
          setError(`root.server-conflict`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        default: {
          Logger.error(`Unknown error in ${EditPotDialog.name}`);
        }
      }
    },
  });

  const handleAddPotSubmit = handleSubmit((data) => {
    const convertedData: EditPotRequest = {
      potName: data.potName,
      newTarget: data.newTarget,
      themeColor: data.themeColor,
    };

    mutate({
      body: convertedData,
      path: {
        potId: id,
      },
    });
  });

  const themeColorSet = new Set(potData?.map((pot) => pot.themeColor));
  const convertedColorHexList = colorHexList.map((hexColor) => ({
    ...hexColor,
    available:
      themeColorSet.has(hexColor.key) && hexColor.key !== themeColor
        ? false
        : true,
  }));

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={toggleEditDialog}>
      <DialogContent>
        <DialogTitle>Edit Pot</DialogTitle>
        <DialogDescription>
          If your saving targets change, feel free to update your pots.
        </DialogDescription>
        <form className={styles.dialog} onSubmit={handleAddPotSubmit}>
          <Field>
            <FieldLabel htmlFor="name">Pot Name</FieldLabel>
            <Input
              type="text"
              id="name"
              placeholder="e.g. Rainy Days"
              {...register("potName", {
                required: "Pot name required",
              })}
            />
            {errors.potName && (
              <FieldError data-testid="edit-pot-potname-error">
                {errors.potName?.message}
              </FieldError>
            )}
            {errors.root?.["server-conflict"] && (
              <FieldError data-testid="server-conflict">
                {errors.root["server-conflict"].message}
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="target">Target Amount</FieldLabel>
            <Input
              type="number"
              step="any"
              id="target"
              placeholder="$ e.g. 2000"
              {...register("newTarget", {
                valueAsNumber: true,
                required: "Target amount required",
                min: {
                  value: 0.01,
                  message: "Minimum of 0.01",
                },
              })}
            />
            {errors.newTarget && (
              <FieldError data-testid="edit-pot-target-error">
                {errors.newTarget?.message}
              </FieldError>
            )}
            {errors.root?.["server-bad-request"] && (
              <FieldError data-testid="server-bad-request">
                {errors.root["server-bad-request"].message}
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="theme-color">Theme</FieldLabel>
            <Controller
              name="themeColor"
              defaultValue={themeColor}
              control={control}
              render={({ field }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="theme-color">
                      <SelectValue placeholder="Select a theme color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {convertedColorHexList?.map(
                          ({ key, value, available }) => (
                            <SelectItem
                              value={key}
                              key={key}
                              disabled={!available}
                            >
                              <div className={styles["theme"]}>
                                <span
                                  className={styles["theme-circle"]}
                                  style={{
                                    "--color-theme-circle": `${value}`,
                                  }}
                                />
                                <span>
                                  {key}&nbsp;
                                  {`${!available ? "(Already in use)" : ""}`}
                                </span>
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.themeColor && (
                    <FieldError>{errors.themeColor?.message}</FieldError>
                  )}
                  {errors.root?.["server-bad-request"] && (
                    <FieldError data-testid="add-pot-server-bad-request">
                      {errors.root["server-bad-request"].message}
                    </FieldError>
                  )}
                </>
              )}
            ></Controller>
          </Field>
          <Button type="submit" variant="cta-primary" disabled={isPending}>
            {isPending ? <Spinner /> : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
