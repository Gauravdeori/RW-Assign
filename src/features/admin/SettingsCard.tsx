import { useI18n } from '../../i18n';
import type { AppSettings, Lang, SettingKey } from '../../types';
import { DotHeading } from '../studio/DotHeading';
import { PillSegmented } from '../studio/PillSegmented';
import { PillSwitch } from '../studio/PillSwitch';
import { StudioCard } from '../studio/StudioCard';

const SETTING_KEYS: SettingKey[] = ['gender', 'jd'];

/** Search settings: these really change the Search page straight away. */
export function SettingsCard({
  settings,
  onToggle,
  onLang,
}: {
  settings: AppSettings;
  onToggle: (key: SettingKey, on: boolean) => void;
  onLang: (l: Lang) => void;
}) {
  const { t } = useI18n();
  const a = t.admin;
  return (
    <StudioCard>
      <DotHeading>{a.settingsTitle}</DotHeading>
      <p className="mt-1 text-[13px] text-muted">{a.settingsSub}</p>
      <ul className="mt-3">
        {SETTING_KEYS.map((key) => {
          const on = key === 'gender' ? settings.showGender : settings.showJdFill;
          return (
            <li key={key} className="flex items-start justify-between gap-4 border-t border-card-line py-4">
              <div>
                <div className="text-[14px] font-medium">{a.setting[key]}</div>
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{a.settingHelp[key]}</p>
              </div>
              <PillSwitch checked={on} onChange={(v) => onToggle(key, v)} label={a.setting[key]} />
            </li>
          );
        })}
        <li className="border-t border-card-line pt-4">
          <div className="text-[14px] font-medium">{a.defaultLang}</div>
          <div className="mt-2.5">
            <PillSegmented
              label={a.defaultLang}
              size="sm"
              value={settings.defaultLang}
              onChange={onLang}
              options={[
                { value: 'en', label: a.langName.en },
                { value: 'ja', label: a.langName.ja },
              ]}
            />
          </div>
        </li>
      </ul>
    </StudioCard>
  );
}
