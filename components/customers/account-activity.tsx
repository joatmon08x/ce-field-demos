import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { paymentMethodLabel } from "@/lib/payments";

export type AccountActivityRow = {
  id: string;
  type: string;
  status: string;
  channel: string | null;
  body: string | null;
  amountCents: number | null;
  method: string | null;
  actorName: string;
  occurredOn: Date;
  invoice: { number: string } | null;
};

export function AccountActivity({ activities }: { activities: readonly AccountActivityRow[] }) {
  return (
    <section aria-labelledby="account-activity-heading" className="flex flex-col gap-3">
      <div className="space-y-1">
        <h2 id="account-activity-heading" className="text-lg font-semibold tracking-tight">
          Activity
        </h2>
        <p className="text-sm text-muted-foreground">
          Collections activity for this account, newest first.
        </p>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity on this account.</p>
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="px-0 py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="text-muted-foreground">
                      <time dateTime={activity.occurredOn.toISOString()}>
                        {formatDate(activity.occurredOn)}
                      </time>
                    </TableCell>
                    <TableCell className="font-mono text-[13px]">{activity.type}</TableCell>
                    <TableCell
                      className={activity.status === "failed" ? "font-medium text-danger" : undefined}
                    >
                      {activity.status}
                    </TableCell>
                    <TableCell>{activity.channel ?? "—"}</TableCell>
                    <TableCell className="font-mono text-[13px]">
                      {activity.invoice?.number ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {activity.amountCents === null ? "—" : formatUsd(activity.amountCents)}
                    </TableCell>
                    <TableCell>{activity.method ? paymentMethodLabel(activity.method) : "—"}</TableCell>
                    <TableCell>{activity.actorName}</TableCell>
                    <TableCell className="max-w-sm whitespace-normal text-muted-foreground">
                      {activity.body ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
