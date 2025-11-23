import styles from "./top-header.module.css";
import { icon_dropdown, icon_units, logo } from "#frontend/assets/images";
import { Button } from "#frontend/shared/primitives/button";
import { Image } from "#frontend/shared/primitives/image";

export function TopHeader() {
  return (
    <div className={styles.layout}>
      <Image src={logo} alt="unit icon" />
      <Button variant="dropdown" intent="unit" disabled={true}>
        <Image src={icon_units} />
        Units
        <Image src={icon_dropdown} />
      </Button>
    </div>
  );
}
