export const dynamic = "force-dynamic";

import { getSettings } from "@/app/actions/settings";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.4rem",
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 24,
        }}
      >
        Settings
      </h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
