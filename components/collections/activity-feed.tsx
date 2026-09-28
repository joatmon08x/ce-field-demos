import { listAccountActivity } from "@/lib/collections/activity";

export async function ActivityFeed({ customerId, plan }: { customerId: string; plan: string }) {
  const activity = await listAccountActivity(customerId);
  if (activity.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }
  return (
    <p className="text-sm text-muted-foreground">
      {activity.length} events on {plan}.
    </p>
  );
}
