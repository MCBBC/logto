import {
  type HookEvent,
  type HookEventPayload,
  ApplicationType,
  type HookConfig,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';
import { got, type Response } from 'got';

import { sign } from '#src/utils/sign.js';

export const parseResponse = ({ statusCode, body }: Response) => ({
  statusCode,
  // eslint-disable-next-line no-restricted-syntax
  body: trySafe(() => JSON.parse(String(body)) as unknown) ?? String(body),
});

type SendWebhookRequest = {
  hookConfig: HookConfig;
  payload: HookEventPayload;
  signingKey: string;
};

export const sendWebhookRequest = async ({
  hookConfig,
  payload,
  signingKey,
}: SendWebhookRequest) => {
  const { url, headers, retries } = hookConfig;

  return got.post(url, {
    headers: {
      'user-agent': 'Logto (https://logto.io/)',
      ...headers,
      ...conditional(signingKey && { 'logto-signature-sha-256': sign(signingKey, payload) }),
      'logto-message-id': generateStandardId(),
    },
    json: payload,
    retry: { limit: retries ?? 3 },
    timeout: { request: 10_000 },
  });
};

export const generateHookTestPayload = (hookId: string, event: HookEvent): HookEventPayload => {
  const fakeUserId = 'fake-user-id';
  const now = new Date();

  return {
    hookId,
    event,
    createdAt: now.toISOString(),
    sessionId: 'fake-session-id',
    userAgent: 'fake-user-agent',
    userId: fakeUserId,
    user: {
      id: fakeUserId,
      username: 'fake-user',
      primaryEmail: 'fake-user@fake-service.com',
      primaryPhone: '1234567890',
      name: 'Fake User',
      avatar: 'https://fake-service.com/avatars/fake-user.png',
      customData: { theme: 'light' },
      identities: {
        google: {
          userId: 'fake-google-user-id',
        },
      },
      applicationId: 'fake-application-id',
      isSuspended: false,
      lastSignInAt: now.getTime(),
      createdAt: now.getTime(),
    },
    application: {
      id: 'fake-spa-application-id',
      type: ApplicationType.SPA,
      name: 'Fake Application',
      description: 'Fake application data for testing',
    },
  };
};
