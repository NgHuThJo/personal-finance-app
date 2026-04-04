import styles from "./budget-card-popover.module.css";
import { Dots } from "#frontend/assets/icons/icons";
import { Button } from "#frontend/shared/primitives/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#frontend/shared/primitives/popover";

type BudgetCardPopover = {
  dialogHandlers: {
    openEditDialog: () => void;
    openDeleteDialog: () => void;
  };
};

export function BudgetCardPopover({
  dialogHandlers: { openDeleteDialog, openEditDialog },
}: BudgetCardPopover) {
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
            Edit Budget
          </Button>
          <Button
            type="button"
            variant="ghost"
            intent="error"
            onClick={openDeleteDialog}
          >
            Delete Budget
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
