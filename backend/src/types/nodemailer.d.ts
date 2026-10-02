declare module 'nodemailer' {
  export interface SentMessageInfo {
    messageId: string
    envelope?: unknown
    accepted?: string[]
    rejected?: string[]
    pending?: string[]
    response?: string
  }

  export type Transporter = {
    sendMail(mailOptions: unknown): Promise<SentMessageInfo>
  }

  export function createTransport(config: unknown): Transporter
}
