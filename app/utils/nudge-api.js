import apiRequest from './api-request';
import { NUDGE_APPLICATION_URL } from '../constants/apis';

export default async function nudgeApplication(applicationId) {
  const response = await apiRequest(
    NUDGE_APPLICATION_URL(applicationId),
    'POST',
  );

  if (!response.ok) {
    throw new Error(`Nudge failed: ${response.status}`);
  }

  return response;
}
