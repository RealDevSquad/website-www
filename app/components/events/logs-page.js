import { registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { removePeerLogsTransformer } from '../../utils/logsTransformer';
import {
  EVENTS_LOGS_POLL_TIME,
  EVENTS_LOGS_TYPE,
  GET_API_CONFIGS,
} from '../../constants/live';
import { APPS } from '../../constants/urls';

export default class LogsPageComponent extends Component {
  @service store;
  @service live;
  @tracked eventLogsData;
  @tracked isLogsLoading;
  @tracked isInitialLoading = true;
  logsPollingInterval;
  LOGS_TYPE_EVENTS_REMOVE_PEER = EVENTS_LOGS_TYPE.EVENTS_REMOVE_PEER;
  @tracked isNoLogsPresent;

  constructor(...args) {
    super(...args);

    (async () => {
      await this.getLogs();
    })();

    this.logsPollingInterval = setInterval(async () => {
      await this.getLogs();
    }, EVENTS_LOGS_POLL_TIME);

    registerDestructor(this, () => {
      clearInterval(this.logsPollingInterval);
    });
  }

  async getLogs() {
    if (this.isInitialLoading) {
      this.isLogsLoading = true;
    }

    try {
      const logsResponse = await fetch(
        `${APPS.API_BACKEND}/logs/${this.LOGS_TYPE_EVENTS_REMOVE_PEER}`,
        {
          ...GET_API_CONFIGS,
          credentials: 'include',
        },
      );

      const logsFromApi = removePeerLogsTransformer(
        (await logsResponse.json())?.logs,
      );

      // filtering logs of current active event
      this.eventLogsData = logsFromApi.filter((log) => {
        return this.live.activeRoomId === log.eventId;
      });

      if (this.eventLogsData.length === 0) {
        this.isNoLogsPresent = true;
      } else {
        this.isNoLogsPresent = false;
      }
    } catch (err) {
      console.error('Something went wrong ', err);
    } finally {
      if (this.isInitialLoading) {
        this.isLogsLoading = false;
        this.isInitialLoading = false;
      }
    }
  }
}
