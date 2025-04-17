import { NotificationConfig } from "@/services/notificationService";

export const notificationConfig: NotificationConfig = {
  channels: ["slack", "email"],
  slackWebhookUrl: process.env.REACT_APP_SLACK_WEBHOOK_URL,
  emailRecipients: process.env.REACT_APP_NOTIFICATION_EMAILS?.split(",") || []
}; 