import { Link } from "react-router";
import { trpc } from "#frontend/lib/trpc";
import { formatNumber } from "#frontend/utils/internationalization/intl";
import { capitalizeFirstLetter } from "#frontend/utils/primitives/string";
import { BudgetQueryOutput } from "#frontend/types/trpc";

type BudgetCardProps = {
  budget: BudgetQueryOutput;
};

function BudgetCard({ budget }: BudgetCardProps) {
  const handleDelete = (category: string) => {};

  return (
    <div>
      <h2>{capitalizeFirstLetter(budget.category)}</h2>
      <p>
        Maximum of $
        {formatNumber(Number(budget.maxAmount), {
          opts: {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        })}
      </p>
      <div>
        <div></div>
      </div>
      <div>
        <div>
          <span>Spent</span>
          <span>
            $
            {formatNumber(Number(budget.spentAmount), {
              opts: {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            })}
            ,
          </span>
        </div>
        <div>
          <span>Free</span>
          <span>
            $
            {formatNumber(
              Number(budget.maxAmount) - Number(budget.spentAmount),
              {
                opts: {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              },
            )}
          </span>
        </div>
      </div>
      <div>
        <div>
          <h3>Latest Spending</h3>
          <Link to="/app/transactions">See All</Link>
        </div>
      </div>
    </div>
  );
}
