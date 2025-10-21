const DEFAULT_CRON_RULE = '0 7 * * *';

const cronRule = process.env.MEMBERSHIP_REMINDER_CRON;
const cronDisabled = cronRule?.toLowerCase?.() === 'off';
const scheduleRule = cronDisabled ? null : cronRule || DEFAULT_CRON_RULE;

export default scheduleRule
  ? {
      membershipExpiryReminder: {
        task: async ({ strapi }: { strapi: any }) => {
          try {
            await strapi.service('api::account.account').sendMembershipExpiryReminders();
          } catch (error) {
            strapi.log?.error?.('Membership expiry reminder cron failed', error);
          }
        },
        options: {
          rule: scheduleRule,
          tz: process.env.CRON_TZ || 'Asia/Kolkata',
        },
      },
    }
  : {};
