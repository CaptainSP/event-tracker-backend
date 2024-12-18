import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mail } from '../entities/mail.entity';
import { MailsService } from '../mails.service';

const systemInstruction = `
### System Instruction for LLM: Handling Mail Content and Extracting Event Data

**Objective:**
Develop a system that processes mail content, identifies whether the mail contains event data, and if so, extracts and returns the event details in a structured JSON format.

**Input:**
Mail content (plain text)

**Output:**
A structured JSON object indicating the presence of event details and, if applicable, the event data itself.

### Steps:

1. **Identify Event Information:**
   - Scan the mail content to determine if it contains event-related information.
   - Events may include meetings, conferences, exams, summits, appointments, etc.

2. **Extract Event Data:**
   If event information is identified, extract the following details:
   - **Date:** Extract the date of the event in ISO format (YYYY-MM-DDTHH:MM:SSZ).
   - **Title:** Extract the title or name of the event.
   - **Priority:** Assign a priority level to the event based on its importance or urgency, represented as an integer between 0 and 100.
   - **Tags:** Generate relevant tags based on the event content. Tags may include keywords such as "Exam," "Summit," "Meeting," etc.

3. **Formulate Response:**
   - If the mail contains event information, construct a JSON object with \`hasEvent\` set to true and include the extracted \`eventData\`.
   - If no event information is identified, set \`hasEvent\` to false.

4. **Dates and Times:**
    - Ensure that dates and times are correctly identified and converted to the appropriate format.
    - Use UTC time zone for consistency.
    - If there is no spesific year, assume the current year. (${new Date().getFullYear()})
    - If there is no spesific time, assume 12:00 PM.

### Example:

#### Mail Content:
\`\`\`
Subject: Project Kick-off Meeting

Dear Team,

We are excited to launch our new project! Please join us for the kick-off meeting on November 15, 2024, at 10:00 AM.

Agenda:
1. Introduction
2. Project Overview
3. Roles and Responsibilities
4. Q&A Session

Looking forward to your participation.

Best regards,
Project Manager
\`\`\`

#### Output:
\`\`\`json
{
  "hasEvent": true,
  "eventData": {
    "startDate": "2023-11-15T10:00:00Z",
    "endDate": "2023-11-15T12:00:00Z",
    "title": "Project Kick-off Meeting",
    "summary": "Kick-off meeting for the new project.",
    "location": "Office Conference Room",
    "priority": 75,
    "tags": ["Meeting"]
  }
}
\`\`\`

### Implementation:

#### 1. Parse Mail Content:
   - Extract key sections (e.g., subject, body, dates, times, etc.)
   - Identify patterns indicative of event data (e.g., dates, times, event-related keywords)

#### 2. Extract Event Details:
   - Use natural language processing (NLP) techniques to identify dates, titles, and relevant content
   - Calculate or assign a priority based on predefined rules

#### 3. Generate Tags:
   - Use keyword extraction techniques to generate relevant tags from the content

### JSON Response Structure:
\`\`\`json
{
  "hasEvent": boolean,
  "eventData": {
    "startDate": "ISO Date string",
    "endDate": "ISO Date string",
    "title": "string",
    "summary": "string",
    "location": "string",
    "priority": number,
    "tags": ["string"]
  }
}
\`\`\`

### Notes:
- Ensure the date is converted to the ISO format correctly.
- Assign priority rationally, considering factors like urgency, date proximity, and content significance.
- Tag generation should be contextually relevant and accurate.

---

This instruction sets a clear task for the LLM and provides guidance on how to achieve the objective while ensuring clarity in the expected output format.
`;

@Processor('gemini', {
  concurrency: 1,
})
export class GeminiConsumer extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private mailService: MailsService,
    @InjectRepository(Mail) private mailRepository: Repository<Mail>,
  ) {
    super();
    this.logger.log('Mail consumer initialized');
  }

  public logger = new Logger(GeminiConsumer.name);

  private genAI = new GoogleGenerativeAI(
    this.configService.get('goggle.apiKey'),
  );
  private model = this.genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction,
  });

  async process(job: any) {
    this.logger.log('Processing job:', job.id);
    return await this.handleEmail(job.data);
  }

  // Step 3: Fetch user emails from Microsoft Graph
  async handleEmail(data: any) {
    const { email, accessToken } = data;
    const body = email.body.content;
    if (body) {
      const chat = this.model.startChat();
      const response = await chat.sendMessage(
        `Sender: ${email.sender.emailAddress.name} - ${email.sender.emailAddress.address}\n\n${body}`,
      );
      const text = response.response.text();
      const jsonInText = text.includes('```json')
        ? text.split('```json')[1].split('```')[0]
        : text;
      const object = JSON.parse(jsonInText);
      const hasEvent = object.hasEvent;
      if (hasEvent) {
        this.mailService.addEvent(accessToken, {
          subject: object.eventData.title,
          body: {
            contentType: 'text',
            content: object.eventData.summary,
          },
          start: {
            dateTime: object.eventData.startDate,
            timeZone: 'UTC',
          },
          end: {
            dateTime: object.eventData.endDate,
            timeZone: 'UTC',
          },
          location: {
            displayName: object.eventData.location,
          },
        });
        this.logger.log('Event data extracted:', object.eventData);
      } else {
        this.logger.log('No event data found in the email.');
      }
      this.logger.log('Generated content:', response.response.candidates[0]);
    }
    return true;
  }
}
