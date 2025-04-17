import { Project, Milestone, Deliverable, Invoice } from "@/types";

export type NotificationChannel = "slack" | "email";

export interface NotificationConfig {
  channels: NotificationChannel[];
  slackWebhookUrl?: string;
  emailRecipients?: string[];
}

export interface NotificationPayload {
  title: string;
  message: string;
  projectId: string;
  projectName: string;
  eventType: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.config.channels.includes("slack") && this.config.slackWebhookUrl) {
      promises.push(this.sendSlackNotification(payload));
    }

    if (this.config.channels.includes("email") && this.config.emailRecipients?.length) {
      promises.push(this.sendEmailNotification(payload));
    }

    await Promise.all(promises);
  }

  private async sendSlackNotification(payload: NotificationPayload): Promise<void> {
    if (!this.config.slackWebhookUrl) return;

    const message = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: payload.title,
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: payload.message
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Project: ${payload.projectName}`
            }
          ]
        }
      ]
    };

    try {
      await fetch(this.config.slackWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
      throw error;
    }
  }

  private async sendEmailNotification(payload: NotificationPayload): Promise<void> {
    if (!this.config.emailRecipients?.length) return;

    // Here you would integrate with your email service provider
    // For example, using SendGrid, AWS SES, or similar
    try {
      // Placeholder for email sending logic
      console.log("Sending email notification:", {
        to: this.config.emailRecipients,
        subject: payload.title,
        body: payload.message
      });
    } catch (error) {
      console.error("Failed to send email notification:", error);
      throw error;
    }
  }
}

// Event-specific notification helpers
export const createProjectNotifications = (config: NotificationConfig) => {
  const service = new NotificationService(config);

  return {
    onProjectCreated: async (project: Project) => {
      await service.sendNotification({
        title: "New Project Created",
        message: `A new project "${project.name}" has been created.`,
        projectId: project.id,
        projectName: project.name,
        eventType: "project.created"
      });
    },

    onProjectStatusChanged: async (project: Project, oldStatus: string) => {
      await service.sendNotification({
        title: "Project Status Updated",
        message: `Project "${project.name}" status changed from ${oldStatus} to ${project.status}.`,
        projectId: project.id,
        projectName: project.name,
        eventType: "project.status_changed",
        metadata: { oldStatus, newStatus: project.status }
      });
    },

    onMilestoneCreated: async (project: Project, milestone: Milestone) => {
      await service.sendNotification({
        title: "New Milestone Created",
        message: `A new milestone "${milestone.title}" has been created in project "${project.name}".`,
        projectId: project.id,
        projectName: project.name,
        eventType: "milestone.created",
        metadata: { milestoneId: milestone.id }
      });
    },

    onMilestoneCompleted: async (project: Project, milestone: Milestone) => {
      await service.sendNotification({
        title: "Milestone Completed",
        message: `Milestone "${milestone.title}" has been completed in project "${project.name}".`,
        projectId: project.id,
        projectName: project.name,
        eventType: "milestone.completed",
        metadata: { milestoneId: milestone.id }
      });
    },

    onDeliverableSubmitted: async (project: Project, deliverable: Deliverable) => {
      await service.sendNotification({
        title: "Deliverable Submitted",
        message: `Deliverable "${deliverable.title}" has been submitted for review in project "${project.name}".`,
        projectId: project.id,
        projectName: project.name,
        eventType: "deliverable.submitted",
        metadata: { deliverableId: deliverable.id }
      });
    },

    onDeliverableApproved: async (project: Project, deliverable: Deliverable) => {
      await service.sendNotification({
        title: "Deliverable Approved",
        message: `Deliverable "${deliverable.title}" has been approved in project "${project.name}".`,
        projectId: project.id,
        projectName: project.name,
        eventType: "deliverable.approved",
        metadata: { deliverableId: deliverable.id }
      });
    },

    onInvoiceCreated: async (project: Project, invoice: Invoice) => {
      await service.sendNotification({
        title: "New Invoice Created",
        message: `A new invoice for ${invoice.amount} has been created for project "${project.name}".`,
        projectId: project.id,
        projectName: project.name,
        eventType: "invoice.created",
        metadata: { invoiceId: invoice.id }
      });
    },

    onInvoicePaid: async (project: Project, invoice: Invoice) => {
      await service.sendNotification({
        title: "Invoice Paid",
        message: `Invoice for ${invoice.amount} has been marked as paid for project "${project.name}".`,
        projectId: project.id,
        projectName: project.name,
        eventType: "invoice.paid",
        metadata: { invoiceId: invoice.id }
      });
    }
  };
}; 