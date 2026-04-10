export const dynamic = "force-dynamic";

import { getSettings } from "@/app/actions/settings";
import { SettingsForm } from "@/components/settings/settings-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsForm settings={settings} />
    </div>
  );
}
