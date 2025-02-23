import { withAppInsights } from '@logto/app-insights/react';
import { conditional } from '@silverhand/essentials';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Case from '@/assets/icons/case.svg';
import PageMeta from '@/components/PageMeta';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import * as pageLayout from '@/onboarding/scss/layout.module.scss';
import { trySubmitSafe } from '@/utils/form';

import ActionBar from '../../components/ActionBar';
import { CardSelector, MultiCardSelector } from '../../components/CardSelector';
import type { Questionnaire } from '../../types';
import { OnboardingPage, Project } from '../../types';
import { getOnboardingPage } from '../../utils';

import * as styles from './index.module.scss';
import { titleOptions, companySizeOptions, reasonOptions, projectOptions } from './options';

function Welcome() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();

  const {
    data: { questionnaire },
    update,
  } = useUserOnboardingData();

  const { control, register, handleSubmit, reset, watch } = useForm<Questionnaire>({
    mode: 'onChange',
  });

  useEffect(() => {
    reset(questionnaire);
  }, [questionnaire, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      await update({ questionnaire: formData });
    })
  );

  const onNext = async () => {
    await onSubmit();
    navigate(getOnboardingPage(OnboardingPage.SignInExperience));
  };

  return (
    <div className={pageLayout.page}>
      <PageMeta titleKey={['cloud.welcome.page_title', 'cloud.general.onboarding']} />
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={pageLayout.content}>
          <Case />
          <div className={styles.title}>{t('cloud.welcome.title')}</div>
          <div className={styles.description}>{t('cloud.welcome.description')}</div>
          <form className={styles.form}>
            <FormField
              title="cloud.welcome.project_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                control={control}
                name="project"
                render={({ field: { onChange, value, name } }) => (
                  <CardSelector
                    name={name}
                    value={value ?? ''}
                    options={projectOptions}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            {/* Check whether it is a business use case */}
            {watch('project') === Project.Company && (
              <>
                <FormField
                  isMultiple
                  title="cloud.welcome.title_field"
                  headlineClassName={styles.cardFieldHeadline}
                >
                  <Controller
                    control={control}
                    name="titles"
                    render={({ field: { onChange, value } }) => (
                      <MultiCardSelector
                        className={styles.titleSelector}
                        optionClassName={styles.option}
                        value={value ?? []}
                        options={titleOptions}
                        onChange={(value) => {
                          onChange(value.length === 0 ? undefined : value);
                        }}
                      />
                    )}
                  />
                </FormField>
                <FormField title="cloud.welcome.company_name_field">
                  <TextInput
                    placeholder={t('cloud.welcome.company_name_placeholder')}
                    {...register('companyName')}
                  />
                </FormField>
                <FormField
                  title="cloud.welcome.company_size_field"
                  headlineClassName={styles.cardFieldHeadline}
                >
                  <Controller
                    control={control}
                    name="companySize"
                    render={({ field: { onChange, value, name } }) => (
                      <CardSelector
                        name={name}
                        value={value ?? ''}
                        options={companySizeOptions}
                        optionClassName={styles.option}
                        onChange={(value) => {
                          onChange(conditional(value && value));
                        }}
                      />
                    )}
                  />
                </FormField>
              </>
            )}
            <FormField
              isMultiple
              title="cloud.welcome.reason_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                control={control}
                name="reasons"
                render={({ field: { onChange, value } }) => (
                  <MultiCardSelector
                    value={value ?? []}
                    options={reasonOptions}
                    onChange={(value) => {
                      onChange(value.length === 0 ? undefined : value);
                    }}
                  />
                )}
              />
            </FormField>
          </form>
        </div>
      </OverlayScrollbar>
      <ActionBar step={1}>
        <Button title="general.next" type="primary" onClick={onNext} />
      </ActionBar>
    </div>
  );
}

export default withAppInsights(Welcome);
