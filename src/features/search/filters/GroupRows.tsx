import { useI18n } from '../../../i18n';
import { FOREIGN_FILTERS, INDUSTRIES, OVERSEAS_FILTERS, POSITIONS, SCHOOL_RATINGS, SENIORITIES, type Filters } from '../../../types';
import type { Patch, Req } from './rowKit';
import { AgeRow } from './rows/AgeRow';
import { ChoiceRow } from './rows/ChoiceRow';
import { CompanyRow } from './rows/CompanyRow';
import { DegreeRow } from './rows/DegreeRow';
import { EnglishRow } from './rows/EnglishRow';
import { GaishiScoreRow } from './rows/GaishiScoreRow';
import { GenderRow } from './rows/GenderRow';
import { GpaRow } from './rows/GpaRow';
import { JapaneseRow } from './rows/JapaneseRow';
import { MultiRow } from './rows/MultiRow';
import { NameRow } from './rows/NameRow';
import { QualRow } from './rows/QualRow';
import { RatingGlossary } from './rows/RatingGlossary';
import { SchoolRow } from './rows/SchoolRow';
import type { SectionKey } from './sections';

/** The rows of one group, shared by both layouts. Each row gets only its own fields, so a click re-renders one row. */
export function GroupRows({
  group,
  f,
  onChange,
  showGender,
  onRequired,
}: {
  group: SectionKey;
  f: Filters;
  onChange: Patch;
  showGender: boolean;
  onRequired: Req['onRequired'];
}) {
  const { t } = useI18n();
  const req: Req = { optional: f.optional, onRequired };
  switch (group) {
    case 'candidate':
      return (
        <>
          <NameRow {...req} last={f.lastName} first={f.firstName} genders={f.genders} showGender={showGender} onChange={onChange} />
          <CompanyRow {...req} current={f.currentCompany} previous={f.previousCompanies} onChange={onChange} />
          <AgeRow {...req} ageMode={f.ageMode} decades={f.decades} ageMin={f.ageMin} ageMax={f.ageMax} onChange={onChange} />
          {showGender && <GenderRow {...req} value={f.genders} onChange={onChange} />}
        </>
      );
    case 'role':
      return (
        <>
          <MultiRow
            {...req}
            label={t.rowSeniority}
            field="seniority"
            row="seniority"
            value={f.seniority}
            options={SENIORITIES}
            labels={t.seniorityShort}
            titles={t.seniorityButton}
            onChange={onChange}
            withCode
          />
          <MultiRow
            {...req}
            label={t.rowIndustry}
            field="industries"
            row="industry"
            value={f.industries}
            options={INDUSTRIES}
            labels={t.industry}
            onChange={onChange}
            tiles
          />
          <MultiRow
            {...req}
            label={t.rowPosition}
            field="positions"
            row="position"
            value={f.positions}
            options={POSITIONS}
            labels={t.position}
            onChange={onChange}
            tiles
          />
        </>
      );
    case 'gaishi':
      return (
        <>
          <GaishiScoreRow
            {...req}
            value={f.gaishiScores}
            englishMin={f.englishMin}
            foreign={f.foreign}
            overseas={f.overseas}
            onChange={onChange}
          />
          {/* The score's parts, indented under it with a thin guide line: 7px + 2px line + 15px = --indent (24px). */}
          <div className="ml-[7px] border-l-2 border-line pl-[calc(var(--indent)-9px)]">
            <div className="divide-y divide-line">
              <EnglishRow {...req} level={f.englishMin} toeic={f.toeic} onChange={onChange} />
              <JapaneseRow {...req} level={f.japaneseMin} jlpt={f.jlpt} onChange={onChange} />
              <ChoiceRow
                {...req}
                label={t.overseasLabel}
                field="overseas"
                row="overseas"
                value={f.overseas}
                options={OVERSEAS_FILTERS}
                labels={t.overseas}
                onChange={onChange}
              />
              <ChoiceRow
                {...req}
                label={t.foreignLabel}
                field="foreign"
                row="foreign"
                value={f.foreign}
                options={FOREIGN_FILTERS}
                labels={t.foreign}
                onChange={onChange}
              />
            </div>
          </div>
        </>
      );
    case 'education':
      return (
        <>
          <DegreeRow {...req} degrees={f.degrees} majorFor={f.majorFor} onChange={onChange} />
          <MultiRow
            {...req}
            label={t.schoolRatingLabel}
            field="schoolRatings"
            row="schoolRating"
            value={f.schoolRatings}
            options={SCHOOL_RATINGS}
            labels={t.schoolRating}
            onChange={onChange}
            after={<RatingGlossary />}
          />
          <GpaRow {...req} value={f.gpaMin} onChange={onChange} />
          <QualRow {...req} value={f.qualifications} text={f.qualText} onChange={onChange} />
          <SchoolRow {...req} value={f.schoolName} onChange={onChange} />
        </>
      );
  }
}
