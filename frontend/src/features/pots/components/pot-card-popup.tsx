import styles from "./pot-card-popup.module.css";
import { Dots } from "#frontend/assets/icons/icons";
import { EditPotDialog } from "#frontend/features/pots/components/edit-pot.dialog";
import type { GetAllPotsResponse } from "#frontend/shared/client";
import { Button } from "#frontend/shared/primitives/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#frontend/shared/primitives/popover";

type PotCardProps = {
  potData: GetAllPotsResponse;
};

export function PotCardPopup({ potData }: PotCardProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="icon">
          <Dots />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className={styles.layout}>
          <EditPotDialog potData={potData} />
          <div className={styles.separator}></div>
          <button type="button" className={styles["cta-secondary"]}>
            Delete Pot
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
