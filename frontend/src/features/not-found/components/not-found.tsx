import styles from "./not-found.module.css";
import { icon_error, icon_retry } from "#frontend/assets/images";
import { TopHeader } from "#frontend/features/not-found/components/top-header";
import { Button } from "#frontend/shared/primitives/button";
import { Image } from "#frontend/shared/primitives/image";

type NotFoundProps = {
  retry: () => void;
};

export function NotFound({ retry }: NotFoundProps) {
  return (
    <div className={styles.layout}>
      <TopHeader />
      <div className={styles.body}>
        <Image src={icon_error} className="icon-sm" />
        <h1>Something went wrong</h1>
        <p>
          We couldn’t connect to the server (API error). Please try again in a
          few moments.
        </p>
        <Button variant="retry" onClick={retry}>
          <Image src={icon_retry} />
          Retry
        </Button>
      </div>
    </div>
  );
}
