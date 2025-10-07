import Route from '@ember/routing/route';

export default class AdminApplicationsApplicationRoute extends Route {
  model(params) {
    // TODO: Fetch specific application by ID
    return {
      id: params.id,
    };
  }
}
