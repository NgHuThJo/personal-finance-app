import styles from "./pot-card-popover.module.css";
import { Dots } from "#frontend/assets/icons/icons";
import { Button } from "#frontend/shared/primitives/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#frontend/shared/primitives/popover";

type PotCardProps = {
  dialogHandlers: {
    openEditDialog: () => void;
    openDeleteDialog: () => void;
  };
};

export function PotCardPopover({
  dialogHandlers: { openDeleteDialog, openEditDialog },
}: PotCardProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="icon" data-testid="popover">
          <Dots />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className={styles.layout}>
          <Button
            type="button"
            variant="ghost"
            intent="success"
            onClick={openEditDialog}
          >
            Edit Pot
          </Button>
          <Button
            type="button"
            variant="ghost"
            intent="error"
            onClick={openDeleteDialog}
          >
            Delete Pot
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
