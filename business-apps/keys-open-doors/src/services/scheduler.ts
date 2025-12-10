/**
 * Job Scheduler Service
 * 
 * Manages scheduled tasks for scraping and posting.
 * Default schedule: Twice weekly (Monday and Thursday at 6 AM).
 * 
 * @module services/scheduler
 */

import cron from 'node-cron';
import { logger } from '../utils/logger';
import { runScraper } from './scraper';
import { runPoster } from './poster';

/**
 * Scheduled job configuration
 */
interface ScheduledJob {
  name: string;
  schedule: string;
  task: () => Promise<void>;
  enabled: boolean;
}

/**
 * Active cron jobs registry
 */
const activeJobs: Map<string, cron.ScheduledTask> = new Map();

/**
 * Default scheduled jobs
 */
const scheduledJobs: ScheduledJob[] = [
  {
    name: 'monday-scrape',
    // Every Monday at 6:00 AM
    schedule: '0 6 * * 1',
    task: async () => {
      logger.info('Starting scheduled Monday scrape job');
      await runScraper();
      logger.info('Monday scrape job completed');
    },
    enabled: true,
  },
  {
    name: 'thursday-scrape',
    // Every Thursday at 6:00 AM
    schedule: '0 6 * * 4',
    task: async () => {
      logger.info('Starting scheduled Thursday scrape job');
      await runScraper();
      logger.info('Thursday scrape job completed');
    },
    enabled: true,
  },
  {
    name: 'daily-post',
    // Every day at 10:00 AM (post scraped deals)
    schedule: '0 10 * * *',
    task: async () => {
      logger.info('Starting scheduled posting job');
      await runPoster();
      logger.info('Posting job completed');
    },
    enabled: true,
  },
];

/**
 * Initialize all scheduled jobs
 * 
 * @returns Promise resolving when all jobs are scheduled
 * 
 * @example
 * await scheduleJobs();
 * console.log('All jobs scheduled');
 */
export async function scheduleJobs(): Promise<void> {
  logger.info('Initializing scheduled jobs...');

  for (const job of scheduledJobs) {
    if (!job.enabled) {
      logger.info(`Job "${job.name}" is disabled, skipping`);
      continue;
    }

    // Validate cron expression
    if (!cron.validate(job.schedule)) {
      logger.error(`Invalid cron expression for job "${job.name}": ${job.schedule}`);
      continue;
    }

    // Create and register the job
    const scheduledTask = cron.schedule(job.schedule, async () => {
      try {
        logger.info(`Running job: ${job.name}`);
        await job.task();
      } catch (error) {
        logger.error(`Job "${job.name}" failed:`, { error: error instanceof Error ? error.message : error });
      }
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'America/New_York',
    });

    activeJobs.set(job.name, scheduledTask);
    logger.info(`Scheduled job "${job.name}" with cron: ${job.schedule}`);
  }

  logger.info(`${activeJobs.size} jobs scheduled successfully`);
}

/**
 * Manually trigger a scheduled job
 * 
 * @param jobName - Name of the job to trigger
 * @returns Promise resolving when job completes
 * 
 * @example
 * await triggerJob('monday-scrape');
 */
export async function triggerJob(jobName: string): Promise<void> {
  const job = scheduledJobs.find(j => j.name === jobName);
  
  if (!job) {
    throw new Error(`Job "${jobName}" not found`);
  }

  logger.info(`Manually triggering job: ${jobName}`);
  await job.task();
}

/**
 * Stop a scheduled job
 * 
 * @param jobName - Name of the job to stop
 * 
 * @example
 * stopJob('daily-post');
 */
export function stopJob(jobName: string): void {
  const task = activeJobs.get(jobName);
  
  if (task) {
    task.stop();
    activeJobs.delete(jobName);
    logger.info(`Stopped job: ${jobName}`);
  } else {
    logger.warn(`Job "${jobName}" not found in active jobs`);
  }
}

/**
 * Stop all scheduled jobs
 * 
 * @example
 * stopAllJobs();
 */
export function stopAllJobs(): void {
  for (const [name, task] of activeJobs) {
    task.stop();
    logger.info(`Stopped job: ${name}`);
  }
  activeJobs.clear();
  logger.info('All jobs stopped');
}

/**
 * Get status of all scheduled jobs
 * 
 * @returns Array of job statuses
 * 
 * @example
 * const statuses = getJobStatuses();
 * console.log(statuses);
 */
export function getJobStatuses(): Array<{
  name: string;
  schedule: string;
  enabled: boolean;
  running: boolean;
}> {
  return scheduledJobs.map(job => ({
    name: job.name,
    schedule: job.schedule,
    enabled: job.enabled,
    running: activeJobs.has(job.name),
  }));
}

export default {
  scheduleJobs,
  triggerJob,
  stopJob,
  stopAllJobs,
  getJobStatuses,
};

